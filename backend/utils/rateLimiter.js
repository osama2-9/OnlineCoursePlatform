import rateLimit from "express-rate-limit";
const authLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 7,
  message: {
    status: 429,
    error: "Too many requests,please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimit };
