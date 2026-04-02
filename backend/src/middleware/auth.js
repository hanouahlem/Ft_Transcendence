import jwt from 'jsonwebtoken';
import { getEnv } from "../env.js";

export function authMiddleware(req, res, next) {

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }
    try{
        const verifToken = jwt.verify (token, getEnv("JWT_SECRET"));
        // console.log("Token vérifié:", verifToken);
        req.user = verifToken;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token invalide" });
    }
}

export default { authMiddleware };
