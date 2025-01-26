import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { useAuth } from "../../hooks/useAuth";
import ReactMarkdown from "react-markdown";

export const UpdateQuestion = () => {
  const { quizId, quizname, questionId, courseId } = useParams<{
    quizId: string;
    quizname: string;
    questionId: string;
    courseId: string;
  }>();
  const location = useLocation();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState<
    "mcq" | "truefalse" | "text"
  >("mcq");
  const [marks, setMarks] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);

  console.log(location.state);

  useEffect(() => {
    if (location.state?.question) {
      const { question_text, question_type, marks, choices } =
        location.state.question;

      setQuestion(question_text);
      setQuestionType(question_type);
      setMarks(marks);
      if (question_type === "mcq" && choices) {
        setAnswers(choices.options);
        setCorrectAnswer(choices.correctIndex);
      } else if (question_type === "truefalse") {
        setAnswers(["True", "False"]);
        setCorrectAnswer(choices.correctIndex);
      }
    }
  }, [location.state, questionId]);

  const handleUpdateQuestion = async () => {
    if (!question) {
      toast.error("Please enter the question.");
      return;
    }

    if (questionType === "mcq") {
      if (answers.some((answer) => answer === "")) {
        toast.error("Please fill in all answer fields.");
        return;
      }

      if (correctAnswer === null) {
        toast.error("Please select the correct answer.");
        return;
      }
    }

    if (questionType === "truefalse" && correctAnswer === null) {
      toast.error("Please select the correct answer.");
      return;
    }

    try {
      setLoading(true);

      const payloadAnswers =
        questionType === "truefalse" ? ["True", "False"] : answers;

      const res = await axios.put(
        `${API}/instructor/update-question`,
        {
          courseId: courseId,
          instructorId: user?.userId,
          quizId: quizId,
          questionId: questionId,
          question_text: question,
          question_type: questionType,
          mark: marks,
          answers: payloadAnswers,
          correct_answer: correctAnswer,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data) {
        toast.success("Question updated successfully!");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to update question");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const handleRemoveAnswer = (index: number) => {
    const updatedAnswers = answers.filter((_, i) => i !== index);
    setAnswers(updatedAnswers);
    if (correctAnswer === index) {
      setCorrectAnswer(null);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">
          Update Question in Quiz{" "}
          <span className="text-blue-600">{quizname}</span>
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) =>
                setQuestionType(e.target.value as "mcq" | "truefalse" | "text")
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="truefalse">True/False</option>
              <option value="text">Text Answer</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question (use Markdown for formatting)"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div
              className="p-4 bg-gray-50 rounded-md"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <ReactMarkdown>{question}</ReactMarkdown>
            </div>
          </div>

          {questionType !== "text" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answers
              </label>
              {questionType === "mcq" &&
                answers.map((answer, index) => (
                  <div key={index} className="flex items-center mb-3">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Answer ${index + 1}`}
                    />
                    <button
                      onClick={() => handleRemoveAnswer(index)}
                      className="ml-2 p-2 text-red-500 rounded-md hover:bg-red-100"
                    >
                      Remove
                    </button>
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={index}
                      checked={correctAnswer === index}
                      onChange={() => setCorrectAnswer(index)}
                      className="ml-2"
                    />
                  </div>
                ))}

              {questionType === "mcq" && (
                <button
                  onClick={handleAddAnswer}
                  className="w-full p-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
                >
                  Add Answer
                </button>
              )}

              {questionType === "truefalse" && (
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value="true"
                      checked={correctAnswer === 0}
                      onChange={() => setCorrectAnswer(0)}
                      className="mr-2"
                    />
                    True
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value="false"
                      checked={correctAnswer === 1}
                      onChange={() => setCorrectAnswer(1)}
                      className="mr-2"
                    />
                    False
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mark
            </label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(parseInt(e.target.value))}
              placeholder="Enter the mark"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleUpdateQuestion}
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Updating Question..." : "Update Question"}
          </button>
        </div>
      </div>
    </InstructorLayout>
  );
};
