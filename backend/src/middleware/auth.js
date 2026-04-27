import jwt from 'jsonwebtoken';
import { getEnv } from "../env.js";

export function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || typeof authorization !== "string") {
        return res.status(401).json({ message: "Token manquant" });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Token invalide" });
    }

    try{
        const verifToken = jwt.verify (token, getEnv("JWT_SECRET"));
        req.user = verifToken;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token invalide" });
    }
}

export default { authMiddleware };
