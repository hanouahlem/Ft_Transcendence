import { getEnv } from "../env.js";

export function apiKeyMiddleware(req, res, next) {
    // Routes publiques
    const publicRoutes = ["/login", "/registerUser"];
    if (publicRoutes.includes(req.path)) return next();

    const token = req.headers['x-api-key'];
    if (!token) {
        return res.status(401).json({ message: "apiKey missing" });
    }
    if (process.env.API_KEY !== token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

export default { apiKeyMiddleware };