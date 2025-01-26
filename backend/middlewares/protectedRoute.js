import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protectedRoute = (req, res, next) => {
  try {
    const token = req.cookies.auth;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized: Token has expired",
      });
    }

    return res.status(500).json({
      error: "Error while checking authentication",
    });
  }
};

export default protectedRoute;
