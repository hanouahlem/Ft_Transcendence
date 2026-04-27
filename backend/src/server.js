import express from "express";
import cors from "cors";
import multer from "multer";
import { createServer } from "http";
import path from "path";
import { validateEnv } from "./env.js";
import route from "./routes/routes.js";
import { attachSocketServer } from "./socket.js";
import publicApiRoutes from "./routes/publicApi.routes.js";
import { swaggerUi, swaggerSpec } from "./swagger.js";

try {
  validateEnv();
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1); // Permet a Express de recuperer la vraie IP du client derriere un proxy
app.use(cors());
app.use(express.json());


// Route simple pour verifier que le serveur est actif
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/public", publicApiRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

let isShuttingDown = false;


// fonction appelee quand on arrete le serveur
const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true; // Empeche les appels multiples à shutdown

  console.log(`Received ${signal}. Shutting down gracefully...`);
  // stop le serveur proprement
  httpServer.close((error) => {
    if (error) {
      console.error("Error during HTTP server shutdown:", error);
      process.exit(1);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 9000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
