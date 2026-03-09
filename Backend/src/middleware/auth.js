
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import e from 'express';
dotenv.config();

export function authMiddleware(req, res, next) {

const token = req.header('Authorization');

console.log("Token received:", token);
// if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
// }
next();


}

export default { authMiddleware };