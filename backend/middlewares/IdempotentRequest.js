import { getCache } from "../services/redis/cache.js";
export const idempotentRequest = async (req, res, next) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"];

    if (!idempotencyKey)
      return res.status(400).json({ error: "Missing idempotency key" });
    const cached = await getCache(idempotencyKey);
    if (cached) return res.status(200).json(cached);

    res.locals.idempotencyKey = idempotencyKey;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};