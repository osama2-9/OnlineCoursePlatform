import { ReactNode } from "react";
import { InstructorSidebar } from "../components/instrctor/Sidebar";

interface LearnerLayoutProps {
  children: ReactNode;
}

export const InstructorLayout = ({ children }: LearnerLayoutProps) => {
  return (
    <div className="flex min-h-screen max-w-full">
      <div className="lg:w-64 lg:bg-white lg:shadow-lg">
        <InstructorSidebar />
      </div>

      <div className="flex-1 p-2  bg-gray-100 ">{children}</div>
    </div>
  );
};
