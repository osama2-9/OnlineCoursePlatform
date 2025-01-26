import express from "express";
import {
  activeEmailRequest,
  isAuthenticated,
  login,
  logout,
  resetPasswordRequest,
  setNewPassword,
  signup,
  verifyEmail,
} from "../controllers/authController.js";
import protectedRoute from "../middlewares/protectedRoute.js";

const authRoute = express.Router();
authRoute.get("/check-auth", isAuthenticated);
authRoute.post("/signup", signup);
authRoute.post("/login", login);
authRoute.post("/logout", logout);
authRoute.post("/active-email-request", protectedRoute, activeEmailRequest);
authRoute.post("/verify-email", protectedRoute, verifyEmail);
authRoute.post("/reset-password-request", resetPasswordRequest);
authRoute.post("/set-new-password", setNewPassword);

export default authRoute;
