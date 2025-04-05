import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../prisma/prismaClint.js';



export const generateChatAccessToken = async (userId) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                user_id: userId,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const token = jwt.sign({ userId }, process.env.JWT_SECRET);
        return token;

    } catch (error) {
        console.log(error)
        throw new Error("error while genreate the chat access token");

    }


  }
  
export const verifyChatAccess = (req ,res ,next) =>{
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: Token missing",
      });
    }

    const decoded =  jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
      });
    }

    next();
  } catch (error) {
    console.error("Error verifying access token:", error.message);
    return { isValid: false, message: error.message };
  }
};