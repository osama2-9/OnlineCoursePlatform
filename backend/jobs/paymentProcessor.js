import { prisma } from "../prisma/prismaClint.js";

export async function checkAndExpirePayments() {
  try {
    const now = new Date(Date.now() - 15 * 60 * 1000); 

    const result = await prisma.$transaction(async (tx) => {
      const payments = await tx.payments.findMany({
        where: {
          payment_status: "pending",
          created_at: { lt: now },
        },
        select: { payment_id: true },
      });

      if (payments.length === 0) {
        console.log("[CRON] No expired payments found.");
        return { updated: 0 };
      }

      const update = await tx.payments.updateMany({
        where: { payment_id: { in: payments.map((p) => p.payment_id) } },
        data: {
          payment_status: "failed",
          updated_at: new Date(),
        },
      });

      return { updated: update.count };
    });

    console.log(`[CRON] ${result.updated} expired payments updated.`);
  } catch (error) {
    console.error("[CRON] Failed to check payments:", error.message);
  }
}
