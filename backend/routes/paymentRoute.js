import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import {
  createCheckoutSession,
  getPayments,
  handlePaymentCancel,
  handlePaymentSuccess,
} from "../controllers/paymentController.js";
import { checkRole } from "../middlewares/checkRole.js";
import { idempotentRequest } from "../middlewares/IdempotentRequest.js";
const paymentRoute = express.Router();

paymentRoute.post(
  "/create-checkout-session",
  protectedRoute,
  idempotentRequest,
  createCheckoutSession
);

paymentRoute.get("/payment-success/:sessionId", handlePaymentSuccess);
paymentRoute.get("/payment-data", checkRole("admin"), getPayments);
paymentRoute.get("/payment-cancel/:sessionId", handlePaymentCancel);

export default paymentRoute;
