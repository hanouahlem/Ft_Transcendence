import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOTPEmail(to, code) {
  await transporter.sendMail({
    from: `"Transcendence" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Votre code de vérification',
    text: `Votre code de vérification est : ${code}\nIl expire dans 10 minutes.`,
  });
}

































import crypto from 'crypto';
import prisma from '../prisma.js';
import { sendOTPEmail } from '../mailer.js';

// 1. Génère un code et l'envoie par mail
export async function send2FACode(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Génère un code à 6 chiffres
  const code = crypto.randomInt(100000, 999999).toString();

  // Expire dans 10 minutes
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  // Sauvegarde en base
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorCode: code,
      twoFactorExpires: expires,
    },
  });

  // Envoie le mail
  await sendOTPEmail(user.email, code);

  return res.json({ message: 'Code envoyé par mail' });
}

// 2. Vérifie le code saisi par l'utilisateur
export async function verify2FACode(req, res) {
  const userId = req.user.id;
  const { code } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Vérifie que le code existe
  if (!user.twoFactorCode) {
    return res.status(400).json({ message: 'Aucun code envoyé' });
  }

  // Vérifie que le code n'est pas expiré
  if (new Date() > user.twoFactorExpires) {
    return res.status(400).json({ message: 'Code expiré' });
  }

  // Vérifie que le code est correct
  if (user.twoFactorCode !== code) {
    return res.status(401).json({ message: 'Code incorrect' });
  }

  // Active la 2FA et nettoie le code
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorCode: null,
      twoFactorExpires: null,
    },
  });

  return res.json({ message: '2FA activée avec succès' });
}

// 3. Désactive la 2FA
export async function disable2FA(req, res) {
  const userId = req.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorCode: null,
      twoFactorExpires: null,
    },
  });

  return res.json({ message: '2FA désactivée' });
}


if (!user.twoFactorCode) {
    return res.status(400).json({ message: 'No code sent' });
}

if (new Date() > user.twoFactorExpires) {
    return res.status(400).json({ message: 'Code expired' });
}

if (user.twoFactorCode !== code) {
    return res.status(401).json({ message: 'Invalid code' });
}

return res.json({ message: '2FA successfully enabled' });

// disable
return res.json({ message: '2FA successfully disabled' });

// send
return res.json({ message: 'Code sent by email' });