import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectLearnerRoute = ({ element }: { element: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || user.role !== "learner") {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default ProtectLearnerRoute;
