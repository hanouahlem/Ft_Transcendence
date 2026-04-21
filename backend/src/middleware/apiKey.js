import { getEnv } from "../env.js";

export function apiKeyMiddleware(req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key || key !== getEnv("API_KEY_PUBLIC")) {
    return res.status(401).json({ message: "Invalid or missing API key." });
  }

  next();
}
