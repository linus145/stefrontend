'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../services/chat.service';

import { appConfig } from '../lib/config';

/**
 * Shape of a message arriving over the WebSocket.
 * This is the raw payload the Django consumer broadcasts.
 */
export interface WsMessage {
  id: string;
  text: string;
  sender_id: string;
  sender_email: string;
  created_at: string;
}

/**
 * Production-grade WebSocket hook for real-time chat.
 *
 * Why the ticket approach?
 *   Auth tokens live in HTTPOnly cookies (not readable by JS).
 *   The WebSocket connects cross-origin (port 3000 → 8000),
 *   so the browser won't attach the cookie.
 *   We first call a REST endpoint to get the token, then
 *   pass it as a query parameter on the WS URL.
 */
export const useChat = (
  roomId: string | null,
  onMessage?: (msg: WsMessage) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempt = useRef(0);
  const isMounted = useRef(true);
  const MAX_RECONNECT = 5;

  // Keep the callback ref fresh without re-creating the socket
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close(1000, 'cleanup');
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    if (!roomId || !isMounted.current) return;

    // Prevent double sockets
    cleanup();

    // 1. Fetch the JWT from the secure cookie-bridge endpoint
    let token: string | null = null;
    try {
      const resp = await chatService.getWsTicket();
      token = (resp as any)?.data?.token || (resp as any)?.token || null;
    } catch (e) {
      console.error('[Chat WS] Failed to fetch ws-ticket:', e);
      return; // No point connecting without auth
    }

    if (!token) {
      console.warn('[Chat WS] No token received from ws-ticket endpoint');
      return;
    }

    // 2. Open the WebSocket with the token
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = appConfig.wsBaseUrl;
    const socketUrl = `${protocol}//${host}/ws/chat/${roomId}/?token=${token}`;

    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      if (!isMounted.current) return;
      console.log('[Chat WS] Connected to room', roomId);
      setIsConnected(true);
      reconnectAttempt.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          onMessageRef.current?.(data.message);
        }
      } catch (e) {
        console.error('[Chat WS] Bad frame:', e);
      }
    };

    socket.onclose = (event) => {
      if (!isMounted.current) return;
      console.log(`[Chat WS] Disconnected. Code: ${event.code}`);
      setIsConnected(false);
      socketRef.current = null;

      // Auto-reconnect for abnormal closures
      if (event.code !== 1000 && reconnectAttempt.current < MAX_RECONNECT) {
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000);
        console.log(`[Chat WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempt.current + 1})`);
        reconnectAttempt.current += 1;
        reconnectTimer.current = setTimeout(() => connect(), delay);
      }
    };

    socket.onerror = () => {
      // onerror always fires before onclose; no-op here
    };

    socketRef.current = socket;
  }, [roomId, cleanup]);

  const sendMessage = useCallback((text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: text }));
    }
  }, []);

  // Connect on mount / room change, clean up on unmount
  useEffect(() => {
    isMounted.current = true;
    connect();
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [connect, cleanup]);

  return { isConnected, sendMessage };
};
