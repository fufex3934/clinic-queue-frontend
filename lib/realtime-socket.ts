import type { Socket } from "socket.io-client";

/**
 * Tear down a socket without noisy "closed before connection" errors in React Strict Mode.
 */
export function teardownRealtimeSocket(socket: Socket): void {
  socket.removeAllListeners();
  socket.io.opts.reconnection = false;

  if (socket.connected) {
    socket.disconnect();
    return;
  }

  const disconnectOnce = () => {
    socket.off("connect", disconnectOnce);
    socket.disconnect();
  };

  socket.on("connect", disconnectOnce);
  socket.close();
}
