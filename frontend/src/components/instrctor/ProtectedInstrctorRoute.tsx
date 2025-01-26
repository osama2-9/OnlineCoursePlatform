import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedInstractourRoute = ({
  element,
}: {
  element: React.ReactNode;
}) => {
  const { user } = useAuth();
  if (!user || user.role !== "instructor") {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default ProtectedInstractourRoute;
