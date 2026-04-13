import express from "express";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { validateEnv } from "./env.js";
import route from "./routes/routes.js";
import { attachSocketServer } from "./socket.js";

try {
  validateEnv();
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/", route);

const httpServer = createServer(app);
attachSocketServer(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
