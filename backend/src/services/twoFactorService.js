import crypto from "crypto";
import prisma from "../prisma.js";
import { Emailconfirmation } from "../controllers/mailSenderController.js";

const TWO_FACTOR_CODE_TTL_MS = 10 * 60 * 1000;

export function generateTwoFactorCode() {
  return crypto.randomInt(0, 10000).toString().padStart(4, "0");
}

export async function issueTwoFactorCode(user) {
  const code = generateTwoFactorCode();
  const expiresAt = new Date(Date.now() + TWO_FACTOR_CODE_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorcode: code,
      twoFactorExpires: expiresAt,
    },
  });

  await Emailconfirmation(user.email, code);
}

