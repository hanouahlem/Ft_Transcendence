
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import route from "./routes/routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", route);

// Create HTTP server and attach Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" },
});

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

// Authenticate sockets using the same JWT as the REST API
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Token manquant"));
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = payload;
        next();
    } catch {
        next(new Error("Token invalide"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Track this user as online
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join a personal room so we can emit to this user from anywhere
    socket.join(`user:${userId}`);

    // Broadcast updated online list
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    console.log(`User ${userId} connected (socket ${socket.id})`);

    socket.on("disconnect", () => {
        const sockets = onlineUsers.get(userId);
        if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                onlineUsers.delete(userId);
            }
        }
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User ${userId} disconnected (socket ${socket.id})`);
    });
});

// Make io accessible from route handlers (e.g. req.app.get("io"))
app.set("io", io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

