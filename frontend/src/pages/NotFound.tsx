import { useNavigate } from "react-router-dom";
import { HomePageLayout } from "../layouts/HomePageLayout";

export const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirect to the homepage
  };

  return (
    <HomePageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen ">
        <div className="text-center">
          {/* Title */}
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

          {/* Subtitle */}
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Oops! Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-500 max-w-md mb-8">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>

          {/* Go Home Button */}
          <button
            onClick={handleGoHome}
            className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-orange-600 transition duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    </HomePageLayout>
  );
};
