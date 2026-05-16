"use client";

import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ProctoringConfig {
  sessionId: string;
  enableTabLock?: boolean;
  enableFullscreen?: boolean;
  enableCamera?: boolean;
}

export const useProctoring = (config: ProctoringConfig) => {
  const { sessionId, enableTabLock = true, enableFullscreen = true, enableCamera = false } = config;
  const violationCount = useRef(0);
  const splitToastId = useRef<string | number | null>(null);
  const focusToastId = useRef<string | number | null>(null);

  const logViolation = useCallback(async (type: string, metadata: any = {}, severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM') => {
    try {
      violationCount.current += 1;
      await api.post('/proctoring/log-violation/', {
        session_id: sessionId,
        violation_type: type,
        severity: severity,
        metadata: {
          ...metadata,
          browser: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Failed to log proctoring violation:", error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    // 1. Tab Switch & Focus Detection
    const handleFocusGain = () => {
      if (focusToastId.current) {
        toast.dismiss(focusToastId.current);
        focusToastId.current = null;
      }
    };

    const handleFocusLoss = (action: string) => {
      if (enableTabLock) {
        logViolation('TAB_SWITCH', { action }, 'MEDIUM');
        
        if (!focusToastId.current) {
          focusToastId.current = toast.error("External App or Window Detected. Please return to the exam.", {
            duration: Infinity,
            className: "bg-destructive text-destructive-foreground font-bold border-none"
          });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFocusLoss('lost_focus');
      } else {
        handleFocusGain();
      }
    };

    const handleBlur = () => {
      handleFocusLoss('window_blur');
    };

    const handleFocus = () => {
      handleFocusGain();
    };

    // 3. Fullscreen Exit Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && enableFullscreen) {
        logViolation('FULLSCREEN_EXIT', { action: 'exited_fullscreen' }, 'MEDIUM');
      }
    };

    // 4. Clipboard Lockdown (Copy/Paste/Cut)
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('CLIPBOARD_ACCESS', { action: 'copy' }, 'LOW');
      toast.error("Copying is disabled for this exam.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('CLIPBOARD_ACCESS', { action: 'paste' }, 'LOW');
      toast.error("Pasting is disabled for this exam.");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation('CLIPBOARD_ACCESS', { action: 'cut' }, 'LOW');
    };

    // 5. Context Menu (Right Click) Restriction
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation('CLIPBOARD_ACCESS', { action: 'right_click' }, 'LOW');
    };

    // 6. Shortcut & Screenshot Detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        logViolation('SCREENSHOT_ATTEMPT', { key: 'PrintScreen' }, 'MEDIUM');
        toast.error("Screenshots are strictly prohibited.");
      }
      if (e.key === 'F12') {
        e.preventDefault();
        logViolation('SCREENSHOT_ATTEMPT', { key: 'F12_DevTools' }, 'MEDIUM');
      }
      if (e.ctrlKey && (e.shiftKey && (e.key === 'I' || e.key === 'J') || e.key === 'u')) {
        e.preventDefault();
        logViolation('SCREENSHOT_ATTEMPT', { key: 'DevTools_Shortcut' }, 'HIGH');
      }
    };

    // 7. Split Screen & Window Resize Detection
    const handleResize = () => {
      const screenWidth = window.screen.width;
      const currentWidth = window.innerWidth;
      if (currentWidth < screenWidth * 0.85) {
        logViolation('SPLIT_SCREEN_DETECTED', { screenWidth, currentWidth, ratio: currentWidth / screenWidth }, 'MEDIUM');
        if (!splitToastId.current) {
          splitToastId.current = toast.error("Split screen mode detected. Please use the full window to continue.", {
            duration: Infinity,
            className: "bg-destructive text-destructive-foreground font-bold border-none"
          });
        }
      } else {
        if (splitToastId.current) {
          toast.dismiss(splitToastId.current);
          splitToastId.current = null;
        }
      }
    };

    // 8. Mouse Leave
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
         logViolation('EXTERNAL_TOOL_USAGE', { action: 'mouse_left_viewport' }, 'LOW');
      }
    };

    // 9. Docked DevTools Detection
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        logViolation('SCREENSHOT_ATTEMPT', { action: 'docked_tools_detected' }, 'HIGH');
      }
    };

    // Register listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mouseleave', handleMouseLeave);

    const dtInterval = setInterval(checkDevTools, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(dtInterval);
    };
  }, [sessionId, enableTabLock, enableFullscreen, logViolation]);

  return {
    violationCount: violationCount.current,
    logViolation
  };
};
