import { FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ClipLoader } from "react-spinners";


interface QuizControlsProps {
    currentPage: number;
    totalPages: number;
    handlePreviousQuestion: () => void;
    handleNextQuestion: () => void;
    handleSubmitQuiz: () => void;
    isSubmitting: boolean;
  }
  
 export const QuizControls: React.FC<QuizControlsProps> = ({
    currentPage,
    totalPages,
    handlePreviousQuestion,
    handleNextQuestion,
    handleSubmitQuiz,
    isSubmitting,
  }) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-lg shadow-lg z-10">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentPage === 1}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md
            transition-colors text-sm font-medium 
            ${currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"}`}
        >
          <FiChevronLeft className="h-5 w-5" />
          Previous
        </button>
        <div className="flex flex-col sm:flex-row gap-4">
          {currentPage < totalPages && (
            <button
              onClick={handleNextQuestion}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-md
                hover:bg-gray-50 transition-colors border border-gray-200 hover:border-gray-300 text-sm font-medium"
            >
              Next
              <FiChevronRight className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleSubmitQuiz}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 
              transition-colors shadow-md text-sm font-medium flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ClipLoader size={20} color="#FFFFFF" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="h-5 w-5" />
                Submit Quiz
              </>
            )}
          </button>
        </div>
      </div>
    );
  };