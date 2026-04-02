import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { validateEnv } from "./env.js";
import route from "./routes/routes.js";
import { authMiddleware } from "./middleware/auth.js";

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

app.get("/uploads/:filename", authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.resolve("uploads", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  res.sendFile(filePath);
});

app.use("/", route);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
