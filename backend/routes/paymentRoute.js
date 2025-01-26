import express from "express";
import protectedRoute from "../middlewares/protectedRoute.js";
import {
  createCheckoutSession,
  getPayments,
  handlePaymentSuccess,
} from "../controllers/paymentController.js";
import { checkRole } from "../middlewares/checkRole.js";
const paymentRoute = express.Router();

paymentRoute.post(
  "/create-checkout-session",
  protectedRoute,
  createCheckoutSession
);

paymentRoute.get("/payment-success/:sessionId", handlePaymentSuccess);
paymentRoute.get("/payment-data", checkRole("admin"), getPayments);

export default paymentRoute;
