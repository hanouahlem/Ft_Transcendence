import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from 'jsonwebtoken';

dotenv.config();


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function addFriend(req, res) {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "receiverId is required" });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot add yourself" });
        }

        const receiver = await prisma.user.findUnique({
            where: { id: receiverId }
        });

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = await prisma.friends.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        const request = await prisma.friends.create({
            data: {
                senderId,
                receiverId,
                status: "pending"
            }
        });

        return res.status(201).json({
            message: "Friend request sent",
            request
        });
    } catch (error) {
        console.error("addFriend error:", error);
        return res.status(500).json({ message: "Failed to send friend request" });
    }
}

export async function getFriends(rea , res){

}

export async function acceptFriend(rea , res){

}


export async function deleteFriend(rea , res){

}


export default { addFriend, getFriends, acceptFriend, deleteFriend, };