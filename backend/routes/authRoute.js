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
  resetPasswordRequest,
  setNewPassword,
  signup,
  towFADisable,
  towFAEnable,
  verify2FA,
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
authRoute.post("/deactive", protectedRoute, deactiveMyAccount);
authRoute.post("/active-account-request", activeAccountRequest);
authRoute.post("/active-acc-attempt", activeMyAccount);
authRoute.post("/enable2FA", protectedRoute, towFAEnable);
authRoute.post("/verify-2fa", verify2FA);
authRoute.post("/disable2FA", protectedRoute, towFADisable);
authRoute.post("/change-password", protectedRoute, changePassword);

export default authRoute;
