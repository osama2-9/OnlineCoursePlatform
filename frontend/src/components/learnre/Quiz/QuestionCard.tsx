import { QuizPageInterface } from "../../../types/Quiz";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiCheckCircle } from "react-icons/fi";

interface QuestionCardProps {
    question: QuizPageInterface["quiz"]["questions"][0];
    index: number;
    currentPage: number;
    questionsPerPage: number;
    selectedAnswers: Record<number, { answer_id?: number; answer_text?: string }>;
    handleAnswerSelect: (questionId: number, choiceId?: number, answerText?: string) => void;
  }
  
  export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    index,
    currentPage,
    questionsPerPage,
    selectedAnswers,
    handleAnswerSelect,
  }) => {
    return (
      <div
        id={`question-${question.question_id}`}
        key={question.question_id}
        className="bg-white p-6 rounded-lg border border-gray-200 shadow-md transition-all hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-lg font-semibold text-blue-700">
                {index + 1 + (currentPage - 1) * questionsPerPage}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="prose max-w-none text-gray-800">
                {question.question_text ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.question_text}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500">Question text not available</p>
                )}
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-full font-medium ml-4 whitespace-nowrap">
                {question.marks} {question.marks === 1 ? "point" : "points"}
              </span>
            </div>
  
            {question.question_type === "mcq" && (
              <div className="space-y-3 mt-5">
                {question.choices.map((choice) => (
                  <label
                    key={choice.choice_id}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all
                      ${selectedAnswers[question.question_id]?.answer_id === choice.choice_id
                        ? "bg-blue-100 border border-blue-300 shadow-sm"
                        : "hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                      selectedAnswers[question.question_id]?.answer_id === choice.choice_id
                        ? "border-blue-600"
                        : "border-gray-300"
                      }`}>
                      {selectedAnswers[question.question_id]?.answer_id === choice.choice_id && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`question-${question.question_id}`}
                      className="sr-only"
                      checked={selectedAnswers[question.question_id]?.answer_id === choice.choice_id}
                      onChange={() =>
                        handleAnswerSelect(
                          question.question_id,
                          choice.choice_id,
                          choice.choice_text
                        )
                      }
                    />
                    <span className="ml-3 text-gray-700">{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}
  
            {question.question_type === "truefalse" && (
              <div className="grid grid-cols-2 gap-4 mt-5">
                {["True", "False"].map((option, i) => (
                  <label
                    key={i}
                    className={`flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all
                      ${selectedAnswers[question.question_id]?.answer_text === option
                        ? "bg-blue-100 border border-blue-300 shadow-sm"
                        : "hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                      selectedAnswers[question.question_id]?.answer_text === option
                        ? "border-blue-600"
                        : "border-gray-300"
                      }`}>
                      {selectedAnswers[question.question_id]?.answer_text === option && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`question-${question.question_id}`}
                      className="sr-only"
                      checked={selectedAnswers[question.question_id]?.answer_text === option}
                      onChange={() => handleAnswerSelect(question.question_id, undefined, option)}
                    />
                    <span className="ml-3 text-gray-700 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            )}
  
            {question.question_type === "text" && (
              <div className="relative mt-5">
                <textarea
                  className="w-full p-4 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none
                    border border-gray-200 placeholder-gray-400 text-gray-700 resize-none"
                  rows={5}
                  placeholder="Type your answer here..."
                  value={selectedAnswers[question.question_id]?.answer_text || ""}
                  onChange={(e) =>
                    handleAnswerSelect(question.question_id, undefined, e.target.value)
                  }
                />
                {selectedAnswers[question.question_id]?.answer_text && (
                  <div className="absolute bottom-3 right-3 bg-green-100 text-green-600 rounded-full p-1.5">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };