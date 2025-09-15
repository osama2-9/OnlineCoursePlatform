import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../prisma/prismaClint.js";

dotenv.config();
export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.auth;
    const refreshToken = req.cookies.refreshToken;

    if (!token && !refreshToken) {
      return res.status(401).json({
        error: "Unauthorized: No token provided",
      });
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (error) {
        if (error.name === "TokenExpiredError" && refreshToken) {
        } else {
          return res.status(401).json({
            error: "Unauthorized: Invalid token",
          });
        }
      }
    }

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        const storedToken = await prisma.refreshToken.findFirst({
          where: {
            token: refreshToken,
            user_id: decoded.userId,
            revoked: false,
            expires_at: { gt: new Date() },
          },
          include: {
            user: {
              select: {
                user_id: true,
                role: true,
                is_active: true,
              },
            },
          },
        });

        if (!storedToken || !storedToken.user.is_active) {
          return res.status(401).json({
            error: "Unauthorized: Invalid refresh token",
          });
        }

        const newAccessToken = jwt.sign(
          { userId: decoded.userId, role: decoded.role },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("auth", newAccessToken, {
          maxAge: 15 * 60 * 1000,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });

        req.user = decoded;
        return next();
      } catch (error) {
        return res.status(401).json({
          error: "Unauthorized: Invalid refresh token",
        });
      }
    }

    return res.status(401).json({
      error: "Unauthorized: No valid tokens",
    });
  } catch (error) {
    console.error("Protected route error:", error);
    return res.status(500).json({
      error: "Error while checking authentication",
    });
  }
};
