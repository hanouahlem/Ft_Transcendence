import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from 'jsonwebtoken';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function createNotif(req, res){
    try {
        const userId = req.user.id;
        const {content} = req.body;

        if (!content) {
            return res.status(400).json({ message: "content is required" });
        }

        const notif = await prisma.notification.create({
            data: {
                userId, content, read:false
            }
        })
        return res.status(201).json({ notif });
    }

    catch (error){
        console.error("createNotif error: ", error);
        return res.status(500).json({ message: "Failed to create a notification" });
    }

}


export async function getNotif(req, res){

    const userId = req.user.id;
        const {content} = req.body;

        if (!content) {
            return res.status(400).json({ message: "content is required" });
        }

        
}


export async function markAsRead(req, res){

    
}


export async function deleteNotif(req, res){

    
}

export default { createNotif, getNotif, markAsRead, deleteNotif };