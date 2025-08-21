import { FiCheckCircle, FiClock } from "react-icons/fi";
interface QuizHeaderProps {
  quizTitle: string;
  answeredCount: number;
  totalQuestions: number;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  quizTitle,
  answeredCount,
  totalQuestions,
  timeLeft,
  formatTime,
}) => {
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="p-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{quizTitle}</h1>
          <div className="mt-3 flex items-center text-sm">
            <span className="flex items-center">
              <FiCheckCircle className="mr-2 h-5 w-5" />
              {answeredCount} of {totalQuestions} questions answered
            </span>
          </div>
          <div className="w-full h-3 bg-white bg-opacity-20 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        {timeLeft !== 0 && timeLeft !== null && (
          <div className="flex items-center gap-3 bg-white bg-opacity-20 px-6 py-3 rounded-lg shadow-sm">
            <FiClock className="h-6 w-6" />
            <span className="text-2xl font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};