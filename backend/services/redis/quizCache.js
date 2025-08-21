import { getCache, deleteCache, setCache } from "./cache.js";
import { prisma } from "../../prisma/prismaClint.js";

const QUIZ_CACHE_KEY = "quiz_questions_";
const CACHE_TTL = 86400;

export const getQuizQuestionsFromCache = async (quizId) => {
  try {
    const cacheKey = `${QUIZ_CACHE_PREFIX}${quizId}`;
    return await getCache(cacheKey);
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const cacheAllQuizQuestions = async (quizId) => {
  try {
    const cacheKey = `${QUIZ_CACHE_KEY}${quizId}`;

    const questions = await prisma.question.findMany({
      where: { quiz_id: parseInt(quizId) },
      select: {
        question_id: true,
        question_text: true,
        question_type: true,
        marks: true,
        choices: {
          select: {
            choice_id: true,
            choice_text: true,
            is_correct: true,
          },
        },
      },
      orderBy: { question_id: "asc" },
    });

    await setCache(cacheKey, questions, CACHE_TTL);

    return questions;
  } catch (error) {
    console.error("Error caching all quiz questions:", error);
    return null;
  }
};
export const addQuestionToCache = async (quizId, newQuestion) => {
  try {
    const cacheKey = `${QUIZ_CACHE_PREFIX}${quizId}`;

    let cachedQuestions = (await getCache(cacheKey)) || [];

    const formattedQuestion = {
      question_id: newQuestion.question_id,
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type,
      marks: newQuestion.marks,
      choices: newQuestion.choices || [],
    };

    cachedQuestions.push(formattedQuestion);

    await setCache(cacheKey, cachedQuestions, CACHE_TTL);
  } catch (error) {
    console.error("Error adding question to cache:", error);
  }
};
