import express from "express";
import cors from "cors";
import path from "path";
import { validateEnv } from "./env.js";
import route from "./routes/routes.js";
import { apiKeyMiddleware } from "./middleware/apiKey.js";
import publicRoutes from "./routes/publicApi.routes.js";

const app = express(); // ✅ toujours en premier

try {
  validateEnv();
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/uploads", express.static(path.resolve("uploads")));

// 🔓 API PUBLIC (AVEC API KEY)
app.use("/api/public", apiKeyMiddleware, publicRoutes);

// 🔐 API PRIVÉ (frontend)
app.use("/api/v1", route);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

