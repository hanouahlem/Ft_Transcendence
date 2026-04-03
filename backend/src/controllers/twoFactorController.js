import prisma from "../prisma.js";
import crypto from "crypto";
import {Emailconfirmation} from "./mailSenderController.js";
import jwt from "jsonwebtoken";
import { getEnv } from "../env.js";


export async function setupCodeTwoFa(req, res) {

    const userId = req.user.id;
    const user = await prisma.user.findFirst({
        where: {id: userId}
    });

    const code = crypto.randomInt(100000, 999999).toString();
    const timeToExpireCode = new Date(Date.now()+ 10 * 60 * 1000);

    await prisma.user.update({
        where:{id: userId},
        data:{
            twoFactorcode: code,
            twoFactorExpires: timeToExpireCode,
        }
    });

    await Emailconfirmation(user.email, code);
    return res.json({message: "Code sent by email"});
}


export async function checkTwoFaCode(req, res)
{
    try{

        const userId = req.user.id;
        const { code } = req.body;
        
        const user = await prisma.user.findFirst({
            where:{id: userId}
        });
        if(!user.twoFactorcode){
            return res.status(400).json({message: "No code sent"});
        }
        
        if(new Date() > user.twoFactorExpires){
            return res.status(400).json({ message: "Code expired"});
        }
        
        if(user.twoFactorcode !== code){
            return res.status(401).json({ message: "Invalid code"});
        }
        
        await prisma.user.update({
            where:{id: userId},
            data:{
                twoFactorEnabled: true,
                twoFactorExpires: null,
                twoFactorcode : null,
            }
            
        });
        res.json({message: "2FA successfully enabled"});

        }
        catch(error){
            console.error("checkTwoFaCode error:", error);
            res.status(500).json({ message: "Failed to checkTwoFaCode user" });
        }

}


export async function disableTwoFA(req, res){

    const userId = req.user.id;

    await prisma.user.update({
        where:{id: userId},
        data:{
             twoFactorEnabled: false,
            twoFactorExpires: null,
            twoFactorcode: null,
        }
    });
    return res.json({ message: '2FA successfully disabled' });
}

export async function verifyLoginTwoFa(req, res) {
    try {
        const { userId, code } = req.body;

        const user = await prisma.user.findFirst({ where: { id: Number(userId) } });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.twoFactorcode) return res.status(400).json({ message: "No code sent" });
        if (new Date() > user.twoFactorExpires) return res.status(400).json({ message: "Code expired" });
        if (user.twoFactorcode !== code) return res.status(401).json({ message: "Invalid code" });

        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorcode: null, twoFactorExpires: null },
        });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            getEnv("JWT_SECRET"),
            { expiresIn: "3h" }
        );

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("verifyLoginTwoFa error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export default { setupCodeTwoFa, checkTwoFaCode, disableTwoFA, verifyLoginTwoFa };