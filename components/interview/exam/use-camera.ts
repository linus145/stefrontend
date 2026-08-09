'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseCameraProps {
  mode: 'ai' | 'normal';
  logViolation: (type: string, metadata: any, severity: 'LOW' | 'MEDIUM' | 'HIGH') => void;
}

export function useCamera({ mode, logViolation }: UseCameraProps) {
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (mode === 'normal') return;
    
    async function initCamera() {
      try {
        if (typeof window !== 'undefined') {
          (window as any).suspendProctoring = true;
        }

        if (typeof window !== 'undefined' && (window as any).proctoringStream) {
          const stream = (window as any).proctoringStream as MediaStream;
          setLocalCameraStream(stream);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });
        setLocalCameraStream(stream);
      } catch (err) {
        console.error("Camera access failed:", err);
        toast.error("Webcam access is required for identity and surveillance integrity.");
        logViolation("CAMERA_DISABLED", { error: "camera_permission_denied" }, "HIGH");
      } finally {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            (window as any).suspendProctoring = false;
          }
        }, 1500);
      }
    }
    
    initCamera();
  }, [mode, logViolation]);

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && localCameraStream) {
      node.srcObject = localCameraStream;
      node.play().catch(() => { });
    }
  }, [localCameraStream]);

  useEffect(() => {
    return () => {
      if (localCameraStream && typeof window !== 'undefined' && localCameraStream !== (window as any).proctoringStream) {
        localCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localCameraStream]);

  const handleToggleCamera = useCallback(() => {
    if (localCameraStream) {
      const videoTrack = localCameraStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraMuted(!videoTrack.enabled);
      }
    }
  }, [localCameraStream]);

  return {
    localCameraStream,
    isCameraMuted,
    videoCallbackRef,
    handleToggleCamera,
    videoRef
  };
}
