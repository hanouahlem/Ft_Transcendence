import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getEnv } from "./env.js";
import { SOCKET_EVENTS } from "./socketEvents.js";

let io = null;
const userSocketCounts = new Map();

export function getUserRoomName(userId) {
  return `user:${userId}`;
}

function extractSocketToken(socket) {
  const authToken =
    typeof socket.handshake.auth?.token === "string"
      ? socket.handshake.auth.token.trim()
      : "";

  if (authToken) {
    return authToken;
  }

  const authorizationHeader =
    typeof socket.handshake.headers?.authorization === "string"
      ? socket.handshake.headers.authorization.trim()
      : "";

  if (!authorizationHeader) {
    return "";
  }

  if (authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.slice("Bearer ".length).trim();
  }

  return authorizationHeader;
}

export function attachSocketServer(httpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: getEnv("FRONTEND_URL"),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = extractSocketToken(socket);

    if (!token) {
      next(new Error("Authentication required."));
      return;
    }

    try {
      const user = jwt.verify(token, getEnv("JWT_SECRET"));
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = Number(socket.data.user?.id);

    if (!Number.isInteger(userId) || userId < 1) {
      socket.disconnect(true);
      return;
    }

    socket.join(getUserRoomName(userId));

    const currentCount = userSocketCounts.get(userId) ?? 0;
    userSocketCounts.set(userId, currentCount + 1);
    emitOnlineUsers();

    socket.on("disconnect", () => {
      const nextCount = (userSocketCounts.get(userId) ?? 1) - 1;

      if (nextCount > 0) {
        userSocketCounts.set(userId, nextCount);
      } else {
        userSocketCounts.delete(userId);
      }

      emitOnlineUsers();
    });
  });

  return io;
}

function emitOnlineUsers() {
  if (!io) {
    return;
  }

  io.emit(SOCKET_EVENTS.ONLINE_USERS, {
    onlineUserIds: [...userSocketCounts.keys()],
  });
}

export function getSocketServer() {
  if (!io) {
    throw new Error("Socket.io server has not been attached yet.");
  }

  return io;
}
