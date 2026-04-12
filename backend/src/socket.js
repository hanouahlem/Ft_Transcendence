import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getEnv } from "./env.js";

let io = null;

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
  });

  return io;
}

export function getSocketServer() {
  if (!io) {
    throw new Error("Socket.io server has not been attached yet.");
  }

  return io;
}
