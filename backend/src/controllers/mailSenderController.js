import nodemailer from 'nodemailer'
import { text } from 'stream/consumers';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, 
    },
});


export async function Emailconfirmation(to, code){

    await transporter.sendMail({

        from: `"transcendence" <${process.env.MAIL_USER}>`,
        to,
        subject: 'Your verification code',
        text: `Your verification code is: ${code}\nIt expires in 10 minutes.`,
    });
}


export default {Emailconfirmation};