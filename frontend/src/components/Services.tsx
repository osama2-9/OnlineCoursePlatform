import { FaBook, FaClipboardList, FaVideo } from "react-icons/fa";

interface ServicesProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
const ServiceCard = ({ icon, title, description }: ServicesProps) => {
  return (
    <div className="bg-white w-[350px] shadow-lg rounded-lg p-6 relative">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-16">
          <div className="text-4xl text-orange-500 bg-gray-100 p-3 shadow-xl rounded-full absolute top-[-50px] left-1/2 transform -translate-x-1/2">
            {icon}
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h3>

        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  );
};
const Services = () => {
  return (
    <div className="flex lg:flex-row flex-col items-center justify-evenly space-y-12 lg:space-y-0 lg:space-x-6">
      <ServiceCard
        icon={<FaBook />}
        title="Tailored Learning Experiences"
        description="Uplearn offers personalized learning paths that adapt to each user's skills, goals, and pace."
      />
      <ServiceCard
        icon={<FaClipboardList />}
        title="Test Your Knowledge with Quizzes"
        description="Uplearn provides a wide range of interactive quizzes designed to reinforce your learning."
      />
      <ServiceCard
        icon={<FaVideo />}
        title="Flexible Learning on Your Schedule"
        description="Access a wide range of on-demand video courses, allowing you to learn at your own pace."
      />
    </div>
  );
};


export default Services;
