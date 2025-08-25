import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function genreateQuestionAttempt(questionType, quizname, course) {
  try {
    let systemPrompt = "";

    if (questionType === "mcq") {
      systemPrompt =
        'Return response as JSON: {"question": "...", "options": ["A) ...","B) ...","C) ...","D) ..."], "correctAnswer": "A"}';
    } else if (questionType === "truefalse") {
      systemPrompt =
        'Return response as JSON: {"question": "...", "answer": true/false}';
    } else if (questionType === "text") {
      systemPrompt =
        'Return response as JSON: {"question": "..."} with an open-ended, explanation-based question.';
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a ${questionType} question for the quiz "${quizname}" in the course "${course}". 
          
          Requirements:
          - Must be specific to ${course}
          - Relevant to quiz "${quizname}"
          - Focus on practical, real-world application
          - Intermediate difficulty
          - Avoid generic content`,
        },
      ],
    });

    const content = response.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(content);

    if (questionType === "truefalse") {
      return {
        question: parsed.question,
        options: ["True", "False"],
        correctAnswer: parsed.answer ? 0 : 1,
      };
    } else if (questionType === "mcq") {
      return {
        question: parsed.question,
        options: parsed.options,
        correctAnswer: parsed.correctAnswer.charCodeAt(0) - 65,
      };
    } else if (questionType === "text") {
      return {
        question: parsed.question,
        correctAnswer: null,
      };
    }
  } catch (err) {
    console.error(err);
    throw new Error("Error generating question");
  }
}

export async function generateArticleSEOSetting(title, excerpt) {
  try {
    const systemPrompt = `
      You are an expert SEO strategist. Follow these steps before answering:
      1. Analyze the title, excerpt, and content of the article.
      2. Research patterns from popular blogs, news websites, and top-ranking company pages.
      3. Craft a strong, engaging SEO title (max ~60 chars).
      4. Write a compelling meta description (150–160 chars) that encourages clicks.
      5. Generate 8–12 SEO keywords based on trending, high-ranking search terms.
      6. Return response strictly in this JSON format:
      {"seo_title": "...", "seo_description": "...", "seo_keywords": ["...","..."]}
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the article:
          Title: ${title}
          Excerpt: ${excerpt}
          `,
        },
      ],
    });

    const contentRes = response.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(contentRes);
  } catch (err) {
    console.error(err);
    throw new Error("Error generating SEO settings");
  }
}
