import express from "express";
import cors from "cors";
import multer from "multer";
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

app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Files must be 10 MB or smaller.",
    });
  }

  if (
    error instanceof Error &&
    (error.message === "Only image files are allowed." ||
      error.message === "Only image and PDF files are allowed.")
  ) {
    return res.status(400).json({
      message: error.message,
    });
  }

  return next(error);
});

const httpServer = createServer(app);
attachSocketServer(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
