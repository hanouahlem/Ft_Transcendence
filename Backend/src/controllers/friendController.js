import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from 'jsonwebtoken';

dotenv.config();


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function addFriend(req,res){

}

export async function getFriends(rea , res){

}

export async function acceptFriend(rea , res){

}


export async function deleteFriend(rea , res){

}


export default { addFriend, getFriends, acceptFriend, deleteFriend };