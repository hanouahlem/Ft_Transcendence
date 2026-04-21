import { getEnv } from "../env.js";

export function apiKeyMiddleware(req, res, next) {
  if (req.headers["x-api-key"] !== getEnv("API_KEY_PUBLIC")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
