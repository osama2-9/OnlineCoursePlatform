interface QuestionNavigatorProps {
    totalQuestions: number;
    currentQuestionIndex: number;
    selectedAnswers: Record<number, { answer_id?: number; answer_text?: string }>;
    handleQuestionNavigation: (index: number) => void;
  }
  
 export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
    totalQuestions,
    currentQuestionIndex,
    selectedAnswers,
    handleQuestionNavigation,
  }) => {
    const progressPercentage = Math.round(
      (Object.keys(selectedAnswers).length / totalQuestions) * 100
    );
  
    return (
      <div className="lg:w-1/4 order-2 lg:order-1">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md sticky top-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
            Question Navigator
          </h2>
          <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-3 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <button
                key={i}
                onClick={() => handleQuestionNavigation(i)}
                className={`relative h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-all duration-200
                  ${currentQuestionIndex === i
                    ? "bg-blue-600 text-white shadow-md"
                    : selectedAnswers[i + 1]
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
              >
                {i + 1}
                {selectedAnswers[i + 1] && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Quiz Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  