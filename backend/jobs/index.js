import cron from "node-cron";
import { checkAndExpirePayments } from "./paymentProcessor.js";
import dotenv from "dotenv"
import { testConnection } from "../prisma/prismaClint.js";
dotenv.config();

await testConnection()

console.log("[CRON] Starting payment expiration job...");

cron.schedule("*/15 * * * *", async () => {
  console.log("[CRON] Running expiration check...");
  await checkAndExpirePayments();
});
