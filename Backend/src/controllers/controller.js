
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function  allUsers(req, res) {
    const users = await prisma.user.findMany();
    res.send("Backend running");
};

export async function registerUser(req, res) {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { 
            username, 
            email, 
            password: hashedPassword
        }
    });
    res.json(user);
};

export async function loginUser(req, res)
{
    const {email, password} = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}
export default { registerUser, allUsers, loginUser};