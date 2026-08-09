'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Users, Wifi, WifiOff, PhoneOff, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { appConfig } from '@/lib/config';

/* ───────────────────────────────────────────────────────────────
   Built-in WebRTC Peer-to-Peer Meeting Component
   ─────────────────────────────────────────────────────────────── */

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

interface WebRTCMeetingProps {
  roomId: string;
  displayName: string;
  className?: string;
  onEndCall?: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export function WebRTCMeeting({ roomId, displayName, className, onEndCall, isSidebarOpen, setIsSidebarOpen }: WebRTCMeetingProps) {
  // ─── State ───
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ─── Refs ───
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoNodeRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const makingOfferRef = useRef(false);
  const isSettingRemoteRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ─── 1. Get Local Media ───
  const startLocalMedia = useCallback(async () => {
    try {
      // Suspend proctoring camera to avoid device conflicts
      if (typeof window !== 'undefined') {
        (window as any).suspendProctoring = true;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch (firstErr) {
        console.warn('Failed to access high quality media, trying standard fallback...', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      setLocalStream(stream);
      localStreamRef.current = stream;
      if (localVideoNodeRef.current) {
        localVideoNodeRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Failed to access media devices:', err);
      toast.error('Camera & microphone access is required for the video call.');
      return null;
    } finally {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          (window as any).suspendProctoring = false;
        }
      }, 2000);
    }
  }, []);

  // ─── 2. Create Peer Connection ───
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add local tracks to the connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set('remote', remoteStream);
        return next;
      });
      setPeerCount(1);
    };

    // Send ICE candidates to remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: 'ice', candidate: event.candidate.toJSON() })
        );
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        setIsConnected(true);
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setIsConnected(false);
        setPeerCount(0);
        setRemoteStreams(new Map());
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (wsRef.current?.readyState === WebSocket.OPEN && pc.localDescription) {
          wsRef.current.send(
            JSON.stringify({ type: 'offer', sdp: pc.localDescription.sdp })
          );
        }
      } catch (err) {
        console.error('Negotiation error:', err);
      } finally {
        makingOfferRef.current = false;
      }
    };

    return pc;
  }, []);

  // ─── 3. WebSocket Signaling Connection ───
  const connectSignaling = useCallback(
    (stream: MediaStream) => {
      let wsHost = appConfig.wsBaseUrl;

      const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${wsHost}/ws/webrtc/${roomId}/`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const pc = createPeerConnection(stream);

      ws.onopen = () => {
        console.log('[WebRTC] Signaling connected to room:', roomId);
        setIsInitializing(false);
        // Announce join
        ws.send(JSON.stringify({ type: 'join', displayName }));
      };

      ws.onmessage = async (event) => {
        let data: any;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        switch (data.type) {
          case 'peer_joined': {
            // A new peer joined — if we're the "polite" side, we wait for their offer
            // Otherwise create offer
            const isPolite = !displayName.toLowerCase().includes('interviewer');
            if (isPolite) {
              console.log("[WebRTC] We are polite, waiting for remote offer.");
              break;
            }
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              if (ws.readyState === WebSocket.OPEN && pc.localDescription) {
                ws.send(
                  JSON.stringify({ type: 'offer', sdp: pc.localDescription.sdp })
                );
              }
            } catch (err) {
              console.error('Error creating offer on peer_joined:', err);
            }
            break;
          }

          case 'offer': {
            try {
              const offerCollision = (pc.signalingState !== "stable" || makingOfferRef.current);
              const isPolite = !displayName.toLowerCase().includes('interviewer');
              const ignoreOffer = !isPolite && offerCollision;

              if (ignoreOffer) {
                console.log("[WebRTC] Collision detected: ignoring offer because we are impolite.");
                break;
              }

              isSettingRemoteRef.current = true;
              await pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
              isSettingRemoteRef.current = false;

              // Flush pending ICE candidates
              for (const c of pendingCandidatesRef.current) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              }
              pendingCandidatesRef.current = [];

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              if (ws.readyState === WebSocket.OPEN && pc.localDescription) {
                ws.send(
                  JSON.stringify({ type: 'answer', sdp: pc.localDescription.sdp })
                );
              }
            } catch (err) {
              console.error('Error handling offer:', err);
              isSettingRemoteRef.current = false;
            }
            break;
          }

          case 'answer': {
            try {
              if (pc.signalingState === 'stable') {
                console.log('[WebRTC] Connection is already stable, ignoring answer');
                break;
              }
              isSettingRemoteRef.current = true;
              await pc.setRemoteDescription({ type: 'answer', sdp: data.sdp });
              isSettingRemoteRef.current = false;

              // Flush pending ICE candidates
              for (const c of pendingCandidatesRef.current) {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              }
              pendingCandidatesRef.current = [];
            } catch (err) {
              console.error('Error handling answer:', err);
              isSettingRemoteRef.current = false;
            }
            break;
          }

          case 'ice': {
            if (data.candidate) {
              try {
                if (pc.remoteDescription) {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                  // Queue ICE candidates until remote description is set
                  pendingCandidatesRef.current.push(data.candidate);
                }
              } catch (err) {
                console.error('Error adding ICE candidate:', err);
              }
            }
            break;
          }

          case 'peer_left': {
            setPeerCount(0);
            setIsConnected(false);
            setRemoteStreams(new Map());
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
            break;
          }
        }
      };

      ws.onerror = (e) => {
        console.error('[WebRTC] Signaling error:', e);
        setIsInitializing(false);
      };

      ws.onclose = () => {
        console.log('[WebRTC] Signaling disconnected');
        setIsInitializing(false);
      };
    },
    [roomId, displayName, createPeerConnection]
  );

  // ─── 4. Initialize Everything ───
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const stream = await startLocalMedia();
      if (stream && mounted) {
        connectSignaling(stream);
      } else if (mounted) {
        setIsInitializing(false);
      }
    };

    init();

    return () => {
      mounted = false;
      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      // Stop local media tracks
      if (localVideoNodeRef.current?.srcObject) {
        (localVideoNodeRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [startLocalMedia, connectSignaling]);

  // Callback ref for local video — auto-attaches stream when element mounts/moves
  const localVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      localVideoNodeRef.current = node;
      if (node && localStream) {
        node.srcObject = localStream;
      }
    },
    [localStream]
  );

  // ─── 5. Controls ───
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMicMuted((prev) => !prev);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsCamOff((prev) => !prev);
    }
  };

  // ─── 6. Render ───
  const hasRemote = remoteStreams.size > 0;

  return (
    <div className={cn('relative w-full h-full flex flex-col bg-slate-950 overflow-hidden', className)}>
      {/* Video Grid */}
      <div className="flex-1 relative flex items-center justify-center p-2 gap-2">
        {/* Remote Video (Full area when connected) */}
        <div
          className={cn(
            'relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800',
            hasRemote
              ? 'w-full h-full flex items-center justify-center'
              : 'w-1/2 h-full max-h-[600px]'
          )}
        >
          {/* Fixed 16:9 aspect-ratio box — centered in parent, keeps person framed identically */}
          <div
            className={cn(
              "relative overflow-hidden bg-slate-900",
              hasRemote ? "rounded-lg" : "w-full h-full"
            )}
            style={hasRemote ? {
              width: '100%',
              height: '100%',
              maxWidth: 'calc((100vh - 160px) * 16 / 9)',
              maxHeight: '100%',
              aspectRatio: '16 / 9',
              margin: '0 auto',
            } : undefined}
          >
            {/* Single video element — always in DOM so ref & srcObject persist */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={cn(
                "w-full h-full object-cover",
                !hasRemote && "hidden"
              )}
              style={{ filter: 'contrast(1.05) brightness(1.02) saturate(1.05)' }}
            />

            {/* Waiting state */}
            {!hasRemote && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
                    <Users size={36} className="text-slate-400" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-300">Waiting for others to join...</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Share this meeting link with the interviewer or candidate
                  </p>
                </div>
              </div>
            )}

            {/* Remote Participant Label */}
            {hasRemote && (
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md">
                <span className="text-[11px] text-white font-semibold">Participant</span>
              </div>
            )}
          </div>
        </div>

        {/* Local Video side-by-side when waiting for remote */}
        {!hasRemote && (
          <div className="relative w-1/2 h-full max-h-[600px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={cn("w-full h-full object-cover", isCamOff ? "hidden" : "")}
              style={{ transform: 'scaleX(-1)', filter: 'contrast(1.05) brightness(1.02) saturate(1.05)' }}
            />
            {isCamOff && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 absolute inset-0">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
                  <VideoOff size={24} className="text-slate-500" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
              <span className="text-[10px] text-white font-semibold">
                {displayName} (You)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Local Video PIP — rendered at root level so it's never clipped by nested overflow */}
      {hasRemote && (
        <div className="absolute bottom-16 right-4 w-[240px] h-[135px] z-30 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl hover:w-[320px] hover:h-[180px] transition-all duration-300">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={cn("w-full h-full object-cover", isCamOff ? "hidden" : "")}
            style={{ transform: 'scaleX(-1)', filter: 'contrast(1.05) brightness(1.02) saturate(1.05)' }}
          />
          {isCamOff && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 absolute inset-0">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2">
                <VideoOff size={24} className="text-slate-500" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Camera off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
            <span className="text-[10px] text-white font-semibold">
              {displayName} (You)
            </span>
          </div>
        </div>
      )}

      {/* Connection Status Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-lg">
        <div
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            isConnected ? 'bg-emerald-500' : isInitializing ? 'bg-amber-500' : 'bg-slate-500'
          )}
        />
        <span className="text-[10px] text-slate-300 font-semibold">
          {isConnected
            ? `Connected • ${peerCount + 1} participant${peerCount > 0 ? 's' : ''}`
            : isInitializing
              ? 'Connecting...'
              : 'Waiting for participants'}
        </span>
        {isConnected ? (
          <Wifi size={12} className="text-emerald-400" />
        ) : (
          <WifiOff size={12} className="text-slate-500" />
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-full shadow-2xl">
        <button
          onClick={toggleMic}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer',
            isMicMuted
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          )}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={toggleCam}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer',
            isCamOff
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          )}
          title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isCamOff ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        {setIsSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer',
              isSidebarOpen
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            )}
            title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <MessageSquare size={18} />
          </button>
        )}

        {onEndCall && (
          <>
            <div className="w-[1px] h-6 bg-slate-800 mx-1" />
            <button
              onClick={onEndCall}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-200"
            >
              <PhoneOff size={12} />
              End Call
            </button>
          </>
        )}
      </div>

      {/* Initializing Overlay */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-300 font-semibold">Setting up your camera...</p>
            <p className="text-[10px] text-slate-500 mt-1">Please allow camera and microphone access</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
