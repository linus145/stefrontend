"use client";

import React, { useEffect, useRef, useState } from 'react';
import { CameraOffIcon, AlertTriangleIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

interface SurveillanceOverlayProps {
  onViolation: (type: string, metadata: any, severity: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  isActive: boolean;
}

export const SurveillanceOverlay: React.FC<SurveillanceOverlayProps> = ({ onViolation, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState({ face: 'OK', object: 'OK', eyes: 'OK' });
  const [threatBbox, setThreatBbox] = useState<number[] | null>(null);

  // Models refs
  const faceModel = useRef<any>(null);
  const objectModel = useRef<any>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsCameraOn(true);
      }
    } catch (err) {
      setHasPermission(false);
      onViolation('CAMERA_DISABLED', { error: 'permission_denied' }, 'HIGH');
    }
  };

  const loadModels = async () => {
    try {
      await tf.ready();
      faceModel.current = await blazeface.load();
      objectModel.current = await cocoSsd.load();
      setModelsLoaded(true);
      console.log("AI Proctoring models loaded.");
    } catch (err) {
      console.error("Failed to load AI models:", err);
    }
  };

  const threatToastId = useRef<string | number | null>(null);

  const runDetection = async () => {
    if (!videoRef.current || !faceModel.current || !objectModel.current || !isCameraOn) return;

    const video = videoRef.current;

    // 1. Face & Eye Detection
    const faces = await faceModel.current.estimateFaces(video, false);
    
    let currentThreat = false;
    let threatMessage = "";

    if (faces.length === 0) {
      setStatus(prev => ({ ...prev, face: 'MISSING', eyes: 'MISSING' }));
      onViolation('FACE_MISSING', { confidence: 0 }, 'HIGH');
      currentThreat = true;
      threatMessage = "Face not detected. Stay in frame.";
    } else if (faces.length > 1) {
      setStatus(prev => ({ ...prev, face: 'MULTIPLE' }));
      onViolation('MULTIPLE_FACES', { count: faces.length }, 'HIGH');
      currentThreat = true;
      threatMessage = "Multiple people detected.";
    } else {
      const face = faces[0];
      const probability = face.probability ? face.probability[0] : 1;
      const landmarks = face.landmarks;

      if (probability < 0.90) {
        setStatus(prev => ({ ...prev, face: 'OBSCURED' }));
        onViolation('FACE_MISSING', { confidence: probability }, 'MEDIUM');
        // Partial occlusion is a warning but not necessarily a "blocker" toast unless probability is very low
        if (probability < 0.75) {
          currentThreat = true;
          threatMessage = "Face obscured. Clear your face.";
        }
      } else {
        setStatus(prev => ({ ...prev, face: 'OK' }));
      }

      // 2. Eye Tracking
      if (landmarks && landmarks.length >= 2) {
        const rightEye = landmarks[0];
        const leftEye = landmarks[1];
        const eyeDist = Math.sqrt(Math.pow(rightEye[0] - leftEye[0], 2) + Math.pow(rightEye[1] - leftEye[1], 2));
        
        if (eyeDist < 18 || isNaN(rightEye[0])) {
          setStatus(prev => ({ ...prev, eyes: 'COVERED' }));
          onViolation('EYES_HIDDEN', { action: 'eyes_covered' }, 'HIGH');
          currentThreat = true;
          threatMessage = "Eyes covered. Keep your eyes visible.";
        } else {
          setStatus(prev => ({ ...prev, eyes: 'OK' }));
        }
      }
    }

    // 3. Ultra-Sensitive Electronic & Object Detection
    const predictions = await objectModel.current.detect(video);
    const THREAT_CLASSES = ['cell phone', 'remote', 'laptop', 'tv', 'monitor', 'book', 'mouse', 'keyboard', 'electronic', 'tablet'];
    const threat = predictions.find((p: any) => THREAT_CLASSES.includes(p.class) && p.score > 0.10);
    
    if (threat) {
      const label = threat.class === 'tv' || threat.class === 'monitor' ? 'SCREEN' : threat.class.toUpperCase();
      setStatus(prev => ({ ...prev, object: `${label} DETECTED` }));
      setThreatBbox(threat.bbox);
      onViolation('PHONE_DETECTED', { type: threat.class, confidence: threat.score }, 'HIGH');
      currentThreat = true;
      threatMessage = `Electronic device detected: ${label}`;
    } else {
      setStatus(prev => ({ ...prev, object: 'OK' }));
      setThreatBbox(null);
    }

    // 4. Persistent Toast Management
    if (currentThreat) {
      if (!threatToastId.current) {
        threatToastId.current = toast.error(threatMessage, { 
          duration: Infinity,
          className: "bg-red-600 text-white font-bold border-none shadow-2xl",
          icon: <AlertTriangleIcon className="animate-bounce" />
        });
      }
    } else {
      if (threatToastId.current) {
        toast.dismiss(threatToastId.current);
        threatToastId.current = null;
      }
    }
  };

  useEffect(() => {
    if (isActive) {
      startCamera();
      loadModels();
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (threatToastId.current) {
        toast.dismiss(threatToastId.current);
      }
    };
  }, [isActive]);

  // Ultra-Fast Detection Loop (500ms)
  useEffect(() => {
    if (!modelsLoaded || !isCameraOn || !isActive) return;

    const interval = setInterval(() => {
      runDetection();
    }, 500); 

    return () => clearInterval(interval);
  }, [modelsLoaded, isCameraOn, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 group">
      <div className={cn(
        "relative w-48 h-36 bg-slate-950 rounded-xl overflow-hidden border-2 shadow-2xl transition-all duration-300 group-hover:w-72 group-hover:h-52 ring-1 ring-black/50",
        threatBbox ? "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]" : "border-white/10"
      )}>
        {!hasPermission && hasPermission !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 text-red-500 p-4 text-center">
            <CameraOffIcon className="size-8 mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Camera Required</p>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover mirror-mode ${!isCameraOn ? 'hidden' : ''}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Threat Alert Vignette */}
        {threatBbox && (
          <div className="absolute inset-0 pointer-events-none border-[6px] border-red-600/30 animate-pulse z-0" />
        )}

        {/* Real-time Bounding Box for Threats */}
        {threatBbox && (
          <div 
            className="absolute border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse rounded-lg pointer-events-none z-10"
            style={{
              // Flip X because of mirrored video and clamp to prevent overflow
              left: `${Math.max(0, Math.min(95, 100 - ((threatBbox[0] + threatBbox[2]) / 320) * 100))}%`,
              top: `${Math.max(0, Math.min(95, (threatBbox[1] / 240) * 100))}%`,
              width: `${Math.min(100, (threatBbox[2] / 320) * 100)}%`,
              height: `${Math.min(100, (threatBbox[3] / 240) * 100)}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg whitespace-nowrap uppercase tracking-tighter">
              THREAT: {status.object}
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 z-20">
          <div className={`size-2 rounded-full animate-pulse ${threatBbox ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : modelsLoaded ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-[10px] text-white font-black tracking-tight uppercase">
            {threatBbox ? 'VIOLATION DETECTED' : modelsLoaded ? 'AI PROCTORING ACTIVE' : 'INITIALIZING AI...'}
          </span>
        </div>

        {/* Status Indicators overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="flex gap-1">
              <div className={`px-1.5 py-0.5 border rounded text-[8px] font-medium ${status.face === 'OK' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                FACE: {status.face}
              </div>
              <div className={`px-1.5 py-0.5 border rounded text-[8px] font-medium ${status.eyes === 'OK' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                EYES: {status.eyes}
              </div>
              <div className={`px-1.5 py-0.5 border rounded text-[8px] font-medium ${status.object === 'OK' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
                ENV: {status.object}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
