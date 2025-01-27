import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import adminRoute from "./routes/adminRoute.js";
import courseRoute from "./routes/courseRoute.js";
import { v2 as cloudinary } from "cloudinary";
import lessonRoute from "./routes/lessonRoute.js";
import cors from "cors";
import Stripe from "stripe";
import paymentRoute from "./routes/paymentRoute.js";
import enrollmentRoute from "./routes/enrollmentRoute.js";
import learnerRoute from "./routes/learnerRoute.js";
import instructorRoute from "./routes/instructorRoute.js";
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://uplearn-website.vercel.app",
      "https://uplearn-app.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
cloudinary.config({
  cloud_name: process.env.CLOUDE_NAME,
  api_key: process.env.CLOUDE_API,
  api_secret: process.env.CLOUDE_API_SECRET,
});

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/course", courseRoute);
app.use("/api/lesson", lessonRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/enrollment", enrollmentRoute);
app.use("/api/learner", learnerRoute);
app.use("/api/instructor", instructorRoute);

app.listen(process.env.PORT, () => {
  console.log("server work");
});

export default app;
export { stripe };
