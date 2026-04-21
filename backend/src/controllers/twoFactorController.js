import prisma from "../prisma.js";
import { issueTwoFactorCode } from "../services/twoFactorService.js";


export async function setupCodeTwoFa(req, res) {

    const userId = req.user.id;
    const user = await prisma.user.findFirst({
        where: {id: userId}
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA already enabled" });
    }

    await issueTwoFactorCode(user);
    return res.json({message: "Code sent by email"});
}


export async function checkTwoFaCode(req, res)
{
    try{

        const userId = req.user.id;
        const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";

        if (!/^\d{4}$/.test(code)) {
            return res.status(400).json({ message: "Code must contain exactly 4 digits" });
        }
        
        const user = await prisma.user.findFirst({
            where:{id: userId}
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if(!user.twoFactorcode){
            return res.status(400).json({message: "No code sent"});
        }
        
        if(!user.twoFactorExpires || new Date() > user.twoFactorExpires){
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

export default { setupCodeTwoFa, checkTwoFaCode, disableTwoFA};
