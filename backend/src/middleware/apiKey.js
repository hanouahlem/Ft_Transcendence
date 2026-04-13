// import { getEnv } from "../env.js";

// export function apiKeyMiddleware(req, res, next) {
//     // Routes publiques
//     const publicRoutes = ["/login", "/registerUser"];
//     if (req.path === "/login" || req.path === "/registerUser") {
//         return next();
//     }

//     const token = req.headers['x-api-key'];
//     if (!token) {
//         return res.status(401).json({ message: "apiKey missing" });
//     }
//     if (process.env.API_KEY !== token) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }
//     next();
// }

import { getEnv } from "../env.js";

export const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== getEnv("API_KEY")) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }

  next();
};


export default { apiKeyMiddleware };