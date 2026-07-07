"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getStoredAccessToken } from "@/lib/auth/token-storage";
import { teardownRealtimeSocket } from "@/lib/realtime-socket";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const REFRESH_DEBOUNCE_MS = 1200;
const POLL_INTERVAL_MS = 15_000;

export const QUEUE_POLL_INTERVAL_SEC = POLL_INTERVAL_MS / 1000;

export type RealtimeQueueState = {
  isConnected: boolean;
  isPolling: boolean;
};

type TransportMode = "socket" | "poll";

export function useRealtimeQueue(
  clinicId: string | null,
  onUpdate: () => void,
  enabled = true,
): RealtimeQueueState {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transportRef = useRef<TransportMode>("poll");
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!enabled || !clinicId) {
      transportRef.current = "poll";
      setIsConnected(false);
      setIsPolling(false);
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      transportRef.current = "poll";
      setIsConnected(false);
      setIsPolling(false);
      return;
    }

    let socket: Socket | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const clearDebounce = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setIsPolling(false);
    };

    const startPolling = () => {
      if (socketRef.current?.connected) return;
      if (pollIntervalRef.current) return;

      transportRef.current = "poll";
      setIsPolling(true);
      onUpdateRef.current();
      pollIntervalRef.current = setInterval(() => {
        onUpdateRef.current();
      }, POLL_INTERVAL_MS);
    };

    const scheduleRefresh = () => {
      if (transportRef.current !== "socket") return;

      clearDebounce();
      debounceTimer = setTimeout(() => {
        if (transportRef.current !== "socket") return;
        onUpdateRef.current();
      }, REFRESH_DEBOUNCE_MS);
    };

    const onSocketConnected = () => {
      clearDebounce();
      transportRef.current = "socket";
      stopPolling();
      setIsConnected(true);
      onUpdateRef.current();
    };

    const onSocketDisconnected = () => {
      clearDebounce();
      setIsConnected(false);
      startPolling();
    };

    socket = io(`${API_URL}/realtime`, {
      auth: { token },
      query: { clinicId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 30_000,
      randomizationFactor: 0.5,
    });
    socketRef.current = socket;

    socket.on("connect", onSocketConnected);
    socket.on("disconnect", onSocketDisconnected);
    socket.on("connect_error", onSocketDisconnected);
    socket.on("reconnect_failed", onSocketDisconnected);
    socket.on("queue.updated", scheduleRefresh);
    socket.on("queue.added", scheduleRefresh);
    socket.on("queue.served", scheduleRefresh);

    return () => {
      clearDebounce();
      stopPolling();
      transportRef.current = "poll";
      socketRef.current = null;
      setIsConnected(false);
      if (socket) teardownRealtimeSocket(socket);
    };
  }, [clinicId, enabled]);

  return { isConnected, isPolling };
}
