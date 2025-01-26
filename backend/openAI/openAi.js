import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});
export async function genreateQuestionAttempt(questionType, quizname, course) {
  try {
    const systemPrompt = questionType === "mcq" 
      ? "Return the response in this format: {\"question\": \"...\", \"options\": [\"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\"], \"correctAnswer\": \"A\"} where correctAnswer is the letter (A, B, C, or D) of the correct option."
      : "Return the response in this format: {\"question\": \"...\", \"answer\": true/false}";

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a ${questionType} question for quiz called ${quizname} about ${course} course.`,
        },
      ],
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4096,
      top_p: 1,
    });

    let content = response.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedContent = JSON.parse(content);

    if (questionType === "truefalse") {
      return {
        question: parsedContent.question,
        options: ["True", "False"],
        correctAnswer: parsedContent.answer ? 0 : 1, // 0 for True, 1 for False
      };
    } else if (questionType === "mcq") {
      return {
        question: parsedContent.question,
        options: parsedContent.options,
        correctAnswer: parsedContent.correctAnswer.charCodeAt(0) - 65, // Convert 'A' to 0, 'B' to 1, etc.
      };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error generating question");
  }
}
