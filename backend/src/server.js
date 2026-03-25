import express from "express";
import cors from "cors";
import path from "path";
import { validateEnv } from "./env.js";
import route from "./routes/routes.js";
import { apiKeyMiddleware } from "./middleware/apiKey.js";

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

// Ici, toutes les routes passent par API Key middleware
app.use("/api/v1", apiKeyMiddleware, route);
// app.use("/", route);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

