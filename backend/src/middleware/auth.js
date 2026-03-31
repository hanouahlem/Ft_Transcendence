import jwt from 'jsonwebtoken';
import { getEnv } from "../env.js";

export function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, getEnv("JWT_SECRET"));
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expiré, reconnecte-toi." });
        }
        return res.status(401).json({ message: "Token invalide" });
    }
}

export default { authMiddleware };
