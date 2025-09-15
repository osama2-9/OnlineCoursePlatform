import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../prisma/prismaClint.js";
dotenv.config();
export const generateTokenAndSetCookies = async (userId, role, res) => {
  try {
    const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { userId, role },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await prisma.refreshToken.create({
      data: {
        user_id: userId,
        token: refreshToken,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        created_at: new Date(),
      },
    });

    await prisma.refreshToken.deleteMany({
      where: {
        user_id: userId,
        OR: [{ expires_at: { lt: new Date() } }, { revoked: true }],
      },
    });

    res.cookie("auth", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  } catch (error) {
    console.error("Error generating token or setting cookie:", error);
    throw new Error("Internal Server Error");
  }
};
