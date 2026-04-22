"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { SOCKET_EVENTS, type OnlineUsersEvent } from "@/lib/socket-events";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SOCKET_URL = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return API_URL;
  }
})();

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: Set<number>;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!token) {
      return;
    }

    const nextSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    const handleConnect = () => {
      setIsConnected(true);
      setSocket(nextSocket);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setOnlineUserIds(new Set());
      setSocket(null);
    };

    const handleOnlineUsers = (payload: OnlineUsersEvent) => {
      if (!Array.isArray(payload?.onlineUserIds)) {
        return;
      }

      const nextOnlineUserIds = payload.onlineUserIds.filter(
        (userId) => Number.isInteger(userId) && userId > 0,
      );
      setOnlineUserIds(new Set(nextOnlineUserIds));
    };

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.on("connect_error", handleDisconnect);
    nextSocket.on(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.off("connect_error", handleDisconnect);
      nextSocket.off(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
      nextSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUserIds(new Set());
    };
  }, [token]);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      onlineUserIds,
    }),
    [isConnected, onlineUserIds, socket],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used inside a SocketProvider");
  }

  return context;
}
