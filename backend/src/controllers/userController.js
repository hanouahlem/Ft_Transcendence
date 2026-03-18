import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function allUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("allUsers error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function  getUser(req, res) {
    const user = await prisma.user.findUnique({
        where: { id : req.user.id }
    });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
};


export async function registerUser(req, res) {
    
    console.log("req.body =", req.body);
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const userExisting = await prisma.user.findFirst({
            where: {
                OR: [
                    {email},
                    {username}
                ]
            }
        });
        
        if(userExisting){
            return res.status(400).json({message: "Email or username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('registerUser error:', error);
        return res.status(500).json({ message: 'Register failed' });
    }
}


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


export async function searchUser(req, res){

    try{
        const { username } = req.query;

        if (!username)
            return res.status(400).json({message: "Query is required"});

        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: username,
                    mode : "insensitive"
                }
            },
            select: {id: true, username: true, avatar: true}
        });
        return res.status(200).json(users);
    }
    catch(error)
    {
        console.error("searchUsers error:", error);
        return res.status(500).json({ message: "Failed to search users" });
    }
}

export default { registerUser, allUsers, loginUser, getUser, searchUser};