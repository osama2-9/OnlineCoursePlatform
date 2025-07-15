import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
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
import applicationsRoute from "./routes/applicationRoute.js";
import articleRoute from "./routes/articalsRoute.js";
import assignmentsRoute from "./routes/assignmentsRoute.js";
import supportRoute from "./routes/supportRoute.js";
import certificationRoute from "./routes/certificationsRoute.js";
import { rescheduleAllReminders } from "./services/schedule.js";
import moderatorRoute from "./routes/moderatorRoute.js";
import helmet from "helmet";

dotenv.config();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://js.stripe.com",
          "https://cdn.jsdelivr.net",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com/dk5kncp7q",
        ],
        "connect-src": [
          "'self'",
          "https://api.stripe.com",
          "http://localhost:5173",
          "https://uplearn-website.vercel.app",
        ],
        "frame-src": ["'self'", "https://js.stripe.com"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
      },
    },
  })
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://uplearn-website.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://uplearn-website.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ limit: "50mb" }));
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
app.use("/api/application", applicationsRoute);
app.use("/api/articels", articleRoute);
app.use("/api/assignments", assignmentsRoute);
app.use("/api/support", supportRoute);
app.use("/api/moderator", moderatorRoute);
app.use("/api/certifications", certificationRoute);

server.listen(process.env.PORT, () => {
  rescheduleAllReminders();
  console.log("server work");
});

export default app;
export { stripe, io };
