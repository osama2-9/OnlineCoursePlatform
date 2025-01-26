import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const checkRole = (requiredRoles) => (req, res, next) => {
  try {
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!requiredRoles.includes(decoded.role)) {
      return res.status(403).json({
        error: "Access denied: Insufficient role",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Error in checkRole middleware:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
