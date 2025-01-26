import { ReactNode } from "react";
import { AdminSidebar } from "../components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen max-w-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 md:overflow-x-hidden">
        
        {children}
      </div>
    </div>
  );
};
