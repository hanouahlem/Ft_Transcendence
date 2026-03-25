import jwt from 'jsonwebtoken';
import { getEnv } from "../env.js";

export function authMiddleware(req, res, next) {

    // const token = req.header('Authorization');
    const apiKey = req.headers.authorization?.split(" ")[1];
    if (!apiKey) {
        return res.status(401).json({ message: "apiKey missing" });
    }
    try{
        const verifapiKey = jwt.verify (apiKey, getEnv("JWT_SECRET"));
        console.log("apiKey verified:", verifapiKey);
        req.user = verifapiKey;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "apiKey invalid" });
    }
}

export default { authMiddleware };
