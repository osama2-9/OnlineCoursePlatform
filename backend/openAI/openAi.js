import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: token,
});

export async function genreateQuestionAttempt(
  questionType,
  quizname,
  course
) {
  try {
    let systemPrompt = "";

    if (questionType === "mcq") {
      systemPrompt =
        "Return the response in this format: {\"question\": \"...\", \"options\": [\"A) ...\", \"B) ...\", \"C) ...\", \"D) ...\"], \"correctAnswer\": \"A\"} where correctAnswer is the letter (A, B, C, or D) of the correct option.";
    } else if (questionType === "truefalse") {
      systemPrompt =
        "Return the response in this format: {\"question\": \"...\", \"answer\": true/false}";
    } else if (questionType === "text") {
      systemPrompt =
        "Return the response in this format: {\"question\": \"...\"}. Generate an open-ended question that requires a written response and allows for multiple valid answers. Focus on practical application, analysis, or explanation-based questions.";
    }

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a ${questionType} question for the quiz "${quizname}" in the course "${course}". 
          
          Requirements:
          - Make the question specific to ${course} concepts and topics
          - Ensure the question is appropriate for a quiz called "${quizname}"
          - Focus on practical knowledge and real-world application
          - If it's a programming course, include specific technologies, frameworks, or concepts
          - Make the difficulty level suitable for intermediate students
          - Avoid generic questions - be specific to the subject matter`,
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
        correctAnswer: parsedContent.answer ? 0 : 1,
      };
    } else if (questionType === "mcq") {
      return {
        question: parsedContent.question,
        options: parsedContent.options,
        correctAnswer: parsedContent.correctAnswer.charCodeAt(0) - 65,
      };
    } else if (questionType === "text") {
      return {
        question: parsedContent.question,
        correctAnswer: null
      };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error generating question");
  }
}