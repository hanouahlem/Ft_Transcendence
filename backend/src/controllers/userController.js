import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getEnv } from "../env.js";
import prisma from "../prisma.js";

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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({where: { email },});

    if (!user) {
      return res.status(401).json({message: "Email or password is incorrect.",});
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({message: "Email or password is incorrect.",});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getEnv("JWT_SECRET"),
      { expiresIn: "3h" }
    );

    return res.status(200).json({message: "Login successful",token,});
  }

  catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({message: "Server error during login."});
  }
};


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

export async function updateUser(req, res){

    const requestId = parseInt(req.params.id);
    const { username, avatar, bio, status, location} = req.body;


    const userExisting = await prisma.user.findFirst({ 
        where: {username}
    });

    if(userExisting){
        return res.status(400).json({message: "Email or username already exists" });
    }

    try{

        const updatedUser = await prisma.user.update({
            where:{id: requestId},
            data:{
                username,
                avatar,
                bio,
                status,
                location,
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                bio: true,
                status: true,
                location: true,
                createdAt: true,
            }
        });
        res.json(updatedUser);
    }
    catch(error){
        console.error("updateUser error:", error);
        res.status(500).json({ message: "Failed to update user" });
    }

}


export async function updatePassword(req, res){
    
    const { currentPassword, newPassword, confirmPassword} = req.body;
    
    
    try{
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }

         const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const passwordOk = await bcrypt.compare(currentPassword, user.password);
        if (!passwordOk) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
    
        if(newPassword !== confirmPassword){
            return res.status(401).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
        where:{id: req.user.id},
        data:{ password: hashedPassword}
        
        });
        res.json({message: "Password updated successfully" });
    }
    catch(error)
    {
        console.error("updatePassword error:", error);
        res.status(500).json({ message: "Failed to update password" });
    }
}

const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId) || userId < 1) {
      return res.status(400).json({
        message: "Invalid user id.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        status: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erreur getUserById :", error);
    return res.status(500).json({
      message: "Unable to fetch user.",
    });
  }
};

export default {
  registerUser,
  allUsers,
  loginUser,
  getUser,
  getUserById,
  searchUser,
  updateUser,
  updatePassword,
};