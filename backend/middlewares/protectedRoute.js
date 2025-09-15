import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prismaClint.js";

export const protectedRoute = async (req, res, next) => {
  const accessToken = req.cookies.auth;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (accessError) {
    if (!refreshToken) {
      return res.status(401).json({
        error: "Unauthorized: Invalid access token and no refresh token",
      });
    }

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          user_id: decodedRefresh.userId,
          revoked: false,
          expires_at: { gt: new Date() },
        },
        include: { user: { select: { is_active: true } } },
      });

      if (!storedToken || !storedToken.user.is_active) {
        return res.status(401).json({
          error: "Unauthorized: Invalid or deactivated refresh token",
        });
      }

      const newAccessToken = jwt.sign(
        { userId: decodedRefresh.userId, role: decodedRefresh.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.cookie("auth", newAccessToken, {
        maxAge: 15 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      req.user = decodedRefresh;
      return next();
    } catch (refreshError) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid refresh token" });
    }
  }
};
