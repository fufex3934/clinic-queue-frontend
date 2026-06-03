"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getStoredAccessToken } from "@/lib/auth/token-storage";
import { teardownRealtimeSocket } from "@/lib/realtime-socket";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const REFRESH_DEBOUNCE_MS = 800;

export function useRealtimeAppointments(
  clinicId: string | null,
  onUpdate: () => void,
  enabled = true,
): void {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || !clinicId) return;

    const token = getStoredAccessToken();
    if (!token) return;

    let socket: Socket | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onUpdateRef.current();
      }, REFRESH_DEBOUNCE_MS);
    };

    socket = io(`${API_URL}/realtime`, {
      auth: { token },
      query: { clinicId },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socket.on("appointment.updated", scheduleRefresh);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (socket) teardownRealtimeSocket(socket);
    };
  }, [clinicId, enabled]);
}
