// import prisma from "../prisma.js";
// import speakeasy from 'speakeasy';
// import QRCode from 'qrcode';


// export async function setupTowFactor(req, res) {

//     const secret = speakeasy.generateSecret({
//         name : `Transcendence (${req.user.name})`
//     });

//     await prisma.user.update({
//         where: {id: userId},
//         data: {twoFactorSecret :secret.base32}
//     });
//     const qrcode = await QRCode.toDataURL(secret.otpauth_url);
//     return res.json({qrcode});
// }