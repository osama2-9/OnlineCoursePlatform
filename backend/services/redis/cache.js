import { redis } from "./redis.js";
export const setCache = async (key, value, ttlSeconds = 86400) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error("Redis setCache error:", error);
  }
};

export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis getCache error:", error);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis deleteCache error:", error);
  }
};

export const updateQuestionInCache = async (quizId, pageNumber, questionId) => {
  try {
    const cacheKey = `quiz:${quizId}:page:${pageNumber}`;

    let cachedQuestions = (await getCache(cacheKey)) || [];

    console.log(cachedQuestions)
    cachedQuestions = cachedQuestions.filter(
      (question) => question.question_id !== questionId
    );

    await setCache(cacheKey, cachedQuestions);
  } catch (error) {
    console.error("Error updating question in cache:", error);
  }
};