import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { useAuth } from "../../hooks/useAuth";
import ReactMarkdown from "react-markdown";

export const AddQuestions = () => {
  const { quizId, quizname ,coursename } = useParams<{
    quizId: string;
    quizname: string;
    coursename: string;
  }>();
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState<
    "mcq" | "truefalse" | "text"
  >("mcq");
  const { user } = useAuth();
  const [mark, setMark] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Markdown formatting functions
  const formatText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "question-textarea"
    ) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = question.substring(start, end);
    const newText =
      question.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      question.substring(end);
    setQuestion(newText);
    textarea.focus();
    textarea.setSelectionRange(
      start + prefix.length,
      start + prefix.length + selectedText.length
    );
  };

  const addBold = () => formatText("**", "**");
  const addItalic = () => formatText("*", "*");
  const addLink = () => {
    const text = prompt("Enter link text:");
    const url = prompt("Enter URL:");
    if (text && url) {
      formatText(`[${text}](`, `${url})`);
    }
  };
  const addBullet = () => formatText("- ", "\n");
  const addNumberedList = () => formatText("1. ", "\n");
  const addInlineCode = () => formatText("`", "`");
  const addBlockquote = () => formatText("> ", "\n");
  const addHorizontalRule = () => formatText("\n---\n");

  const handleAddQuestion = async () => {
    if (!question) {
      toast.error("Please enter the question.");
      return;
    }

    if (questionType === "mcq") {
      if (choices.some((choice) => choice === "")) {
        toast.error("Please fill in all choice fields.");
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

      const payloadChoices =
        questionType === "truefalse" ? ["True", "False"] : choices;

      const res = await axios.post(
        `${API}/instructor/create-question`,
        {
          courseId: 1, // Replace with dynamic courseId if needed
          instructorId: user?.userId,
          quizId: quizId,
          question_text: question,
          question_type: questionType,
          mark: mark,
          choices: payloadChoices,
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
        toast.success("Question added successfully!");
        setQuestion("");
        setQuestionType("mcq");
        setChoices(["", ""]);
        setCorrectAnswer(null);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
  };

  const handleAddChoice = () => {
    setChoices([...choices, ""]);
  };

  const handleRemoveChoice = (index: number) => {
    const updatedChoices = choices.filter((_, i) => i !== index);
    setChoices(updatedChoices);
    if (correctAnswer === index) {
      setCorrectAnswer(null);
    }
  };

  const handleAiSuggestions = async () => {
    try {
      setAiLoading(true);
      const res = await axios.post(
        `${API}/instructor/get-ai-suggestions`,
        {
          questionType,
          quizname,
          course: coursename,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        // Set the question
        setQuestion(data.question);
        
        if (questionType === "mcq") {
          // Set the choices
          setChoices(data.options);
          
          // Directly use the correctAnswer index
          setCorrectAnswer(data.correctAnswer);
        } else if (questionType === "truefalse") {
          // For true/false questions
          setCorrectAnswer(data.correctAnswer);
        }
        
        toast.success("AI suggestion applied successfully!");
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to get AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Add Questions to Quiz:{" "}
              <span className="text-orange-600">{quizname}</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Create and format your quiz questions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Question Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "mcq", label: "Multiple Choice", icon: "📝" },
                  { value: "truefalse", label: "True/False", icon: "✓" },
                  { value: "text", label: "Text Answer", icon: "📄" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setQuestionType(type.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      questionType === type.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-gray-900">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Editor */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Content
              </label>

              {/* Markdown Toolbar */}
              <div className="bg-gray-50 p-2 rounded-t-lg border border-gray-200 border-b-0">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { icon: "B", action: addBold, title: "Bold" },
                    { icon: "I", action: addItalic, title: "Italic" },
                    { icon: "</>", action: addInlineCode, title: "Code" },
                    { icon: "🔗", action: addLink, title: "Link" },
                    { icon: "•", action: addBullet, title: "Bullet List" },
                    {
                      icon: "1.",
                      action: addNumberedList,
                      title: "Numbered List",
                    },
                    { icon: "❝", action: addBlockquote, title: "Quote" },
                    {
                      icon: "―",
                      action: addHorizontalRule,
                      title: "Horizontal Line",
                    },
                  ].map((tool) => (
                    <button
                      key={tool.title}
                      type="button"
                      onClick={tool.action}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title={tool.title}
                    >
                      {tool.icon}
                    </button>
                  ))}
                  <button
                    onClick={handleAiSuggestions}
                    disabled={aiLoading}
                    className="ml-auto flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Get AI suggestion"
                  >
                    {aiLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Thinking...
                      </>
                    ) : (
                      <>✨ Suggest with AI</>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                id="question-textarea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full p-4 border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[200px]"
              />

              {/* Preview */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <ReactMarkdown>
                    {question || "Preview will appear here..."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Choices Section */}
            {questionType !== "text" && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Answer Options
                </label>

                {questionType === "mcq" && (
                  <div className="space-y-3">
                    {choices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={correctAnswer === index}
                            onChange={() => setCorrectAnswer(index)}
                            className="w-4 h-4 text-orange-500"
                          />
                          <input
                            type="text"
                            value={choice}
                            onChange={(e) =>
                              handleChoiceChange(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 bg-transparent border-0 focus:ring-0"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveChoice(index)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={handleAddChoice}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                    >
                      + Add Another Option
                    </button>
                  </div>
                )}

                {questionType === "truefalse" && (
                  <div className="flex gap-4">
                    {["True", "False"].map((option, index) => (
                      <div
                        key={option}
                        className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          correctAnswer === index
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setCorrectAnswer(index)}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={correctAnswer === index}
                            onChange={() => setCorrectAnswer(index)}
                            className="w-4 h-4 text-orange-500"
                          />
                          <span className="font-medium">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mark Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Mark
              </label>
              <input
                type="number"
                min="1"
                value={mark}
                onChange={(e) =>
                  setMark(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAddQuestion}
              disabled={loading}
              className="w-full p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding Question...
                </span>
              ) : (
                "Add Question"
              )}
            </button>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};
