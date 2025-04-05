import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedSupportRoute = ({ element }: { element: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || user.role !== "support") {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default ProtectedSupportRoute;
