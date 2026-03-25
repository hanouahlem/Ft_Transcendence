import prisma from "../prisma.js";
import crypto from "crypto";
import {confirmationEmail} from "./mailSenderController.js";


export async function setupCodeTowFa(req, res) {

    const userId = req.user.id;
    const user = await prisma.user.findFirst({
        where: {ud: userId}
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
    const userId = read.user.id;
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

// import default { setupCodeTowFa, checkTwoFaCode, disableTwoFA};