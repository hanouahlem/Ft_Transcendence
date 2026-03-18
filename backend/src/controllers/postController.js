import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from 'jsonwebtoken';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function createPost(req, res){

    try{ 
    const {content, image} = req.body;
    if(!content){
        res.status(400).json({message: "Content is required"});
    }
    
    const post = await prisma.post.create({
        data:{
            content,
            image,
            authorId: req.user.id
        }
    });

    res.status(201).json(post);

    }
    catch (error){
        console.error("createPost error:", error);
        res.status(500).json({message: "Server error"});
    }
}

export async function getPosts(req, res) {
    
   
}

export async function deletePost(req, res) {
    
}

export default { createPost, getPosts, deletePost };