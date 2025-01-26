import { ReactNode } from "react";
import { Sidebar } from "../components/learnre/Sidebar";

interface LearnerLayoutProps {
  children: ReactNode;
}

export const LearnerLayout = ({ children }: LearnerLayoutProps) => {
  return (
    <div className="flex min-h-screen max-w-full">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">{children}</div>
    </div>
  );
};
