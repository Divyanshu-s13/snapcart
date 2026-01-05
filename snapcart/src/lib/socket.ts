import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (socket) return socket;

  const fallbackUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? fallbackUrl;

  if (!socketUrl) {
    console.error("⚠️ No socket URL configured (NEXT_PUBLIC_SOCKET_URL)");
    return null;
  }

  socket = io(socketUrl, {
    transports: ["websocket"],
    reconnection: true,
    withCredentials: true,
  });

  return socket;
};