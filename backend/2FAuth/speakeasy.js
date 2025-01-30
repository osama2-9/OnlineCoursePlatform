import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { prisma } from "../prisma/prismaClint.js";

export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 3; i++) {
    codes.push(Math.random().toString(36).slice(2, 10));
  }
  return codes;
};

export const enable2FA = async (userId) => {
  try {
    const backupCodes = generateBackupCodes();
    const secret = speakeasy.generateSecret({
      name: "uplearn",
      length: 20,
    });

    const user = await prisma.users.update({
      where: {
        user_id: userId,
      },
      data: {
        is_2fa_enabled: true,
        two_fa_secret: secret.base32,
        backup_codes: backupCodes,
      },
    });
    if (!user) {
      throw new Error("No user found");
    } else {
      const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
      return { secret: secret.base32, qrCodeDataURL };
    }
  } catch (error) {
    console.log(error);
  }
};

export const verify2FACode = async (email, token) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
      select: {
        two_fa_secret: true,
      },
    });

    if (!user || !user.two_fa_secret) {
      throw new Error("User not found or 2FA is not enabled.");
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: "base32",
      token,
      window: 30,
    });

    if (!isVerified) {
      throw new Error("Invalid 2FA token.");
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new Error(error.message || "An error occurred while verifying 2FA.");
  }
};

export const disable2FA = async (userId) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        two_fa_secret: true,
        is_2fa_enabled: true,
        backup_codes: true,
      },
    });

    if (!user) {
      throw new Error("No user found");
    }
    const disable = await prisma.users.update({
      where: {
        user_id: userId,
      },
      data: {
        is_2fa_enabled: false,
        two_fa_secret: null,
        backup_codes: null,
      },
    });
    if (disable) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};
