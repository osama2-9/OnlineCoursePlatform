import express from "express";
import {
  activeAccountRequest,
  activeEmailRequest,
  activeMyAccount,
  changePassword,
  deactiveMyAccount,
  isAuthenticated,
  login,
  logout,
  me,
  resetPasswordRequest,
  setNewPassword,
  signup,
  towFADisable,
  towFAEnable,
  verify2FA,
  verifyCertification,
  verifyEmail,
} from "../controllers/authController.js";
import protectedRoute from "../middlewares/protectedRoute.js";
import { generateAuthUrl, handleGoogleCallback } from "../googleAuth/google.js";
import { authLimit } from "../utils/rateLimiter.js";

const authRoute = express.Router();

authRoute.get("/check-auth", isAuthenticated);
authRoute.post("/signup", authLimit, signup);
authRoute.post("/login", authLimit, login);
authRoute.get("/me", protectedRoute, me);
authRoute.post("/logout", logout);
authRoute.post("/active-email-request", protectedRoute, activeEmailRequest);
authRoute.post("/verify-email", protectedRoute, verifyEmail);
authRoute.post("/reset-password-request", authLimit, resetPasswordRequest);
authRoute.post("/set-new-password", setNewPassword);
authRoute.post("/deactive", protectedRoute, deactiveMyAccount);
authRoute.post("/active-account-request", authLimit, activeAccountRequest);
authRoute.post("/active-acc-attempt", activeMyAccount);
authRoute.post("/enable2FA", protectedRoute, towFAEnable);
authRoute.post("/verify-2fa", verify2FA);
authRoute.post("/disable2FA", protectedRoute, towFADisable);
authRoute.post("/change-password", protectedRoute, changePassword);

authRoute.get("/google-auth-url", generateAuthUrl);

authRoute.get("/google/callback", handleGoogleCallback);

authRoute.get("/certification-verify", verifyCertification);
export default authRoute;
