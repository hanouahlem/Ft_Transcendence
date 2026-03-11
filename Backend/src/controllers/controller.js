
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
    res.send("All users: " + users );
};

export async function  getUser(req, res) {
    const user = await prisma.user.findUnique({
        where: { id : req.user.id }
    });
    res.json(user);
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

export async function profilUser(req, res) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("✓ Profil : " + user);
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

export async function addFriend(req, res)
{
    const {idFriend} = req.body;
    const user = await prisma.user.findUnique({where: { id : idFriend}});
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    
    if (req.user.id == idFriend){
        return res.status(400).json({message : 'Cannot add yourself'});
    }

    const existing = await prisma.friendship.findFirst({
        where: {
            userId: req.user.id,
            friendId: idFriend
        }
    });
    if (existing){
        return res.status(400).json({message: "You're already friends"});
    }

}



// export async function removeFriend(req, res)
// {

// }


// export async function searchUser(req, res)
// {

// }



// export async function sendNotif(req, res)
// {

// }


// export async function updateProfile(req, res)
// {

// }


export default { registerUser, allUsers, loginUser, profilUser, getUser};