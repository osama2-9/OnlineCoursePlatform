import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectAdminRoute = ({ element }: { element: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default ProtectAdminRoute;
