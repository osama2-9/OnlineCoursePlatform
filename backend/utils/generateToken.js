import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCookies = (userId, role, res) => {
  try {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
      expiresIn: "72h",
    });

    if (token) {
      res.cookie("auth", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        secure: true,
        sameSite: "None",
      });
    }
  } catch (error) {
    console.error("Error generating token or setting cookie:", error);
    throw new Error("Internal Server Error");
  }
};
