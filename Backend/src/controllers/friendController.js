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

export async function getFriends(req , res){
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const friends = await prisma.friends.findMany({
            where: {
                AND : [
                    { status: "accepted"},
                    { OR: [{senderId:userId}, {receiverId: userId}]}
                ]},
            
                include: {
                    sender: true,
                    receiver: true
                }
            });

        const friendsList = friends.map(f => {
            return f.senderId === userId ? f.receiver : f.sender;
        });

        if (friends.length === 0) {
            return res.json([]);
            }

        return res.status(200).json(friendsList);//envoyer la liste a res
    }
    catch (error) {
        console.error("getFriends error: ", error);
        return res.status(500).json({message: "Failed to get Friends"});
    }

}

export async function acceptFriend(rea , res){

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "userId required" });
        }

        const { senderId } = req.body;

        if (!senderId) {
            return res.status(400).json({ message: "senderId is required" });
        }

        const friends = await prisma.friends.findMany({
            where: {
                status: "pending",
                senderId:senderId,
                receiverId: userId
                },
            
                include: {
                    sender: true,
                    receiver: true
                }
            });

            if (friends.length === 0) {
                return res.status(400).json({ message: "Friend request not found" });;
            }
            
            await prisma.friends.update({
                where: { id: friends[0].id},
                data: {status: "accepted"}
            });

            return res.status(200).json({friend: "updated Friend"});

    }
    catch (error) {
        console.error("acceptFriends error: ", error);
        return res.status(500).json({message: "Failed to accept Friend"});
    }
}


export async function deleteFriend(rea , res){

}


export default { addFriend, getFriends, acceptFriend, deleteFriend, };