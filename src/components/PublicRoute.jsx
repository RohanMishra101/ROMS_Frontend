import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If user is logged in, redirect to dashboard
  if (user && user.role === "admin") return <Navigate to="/dashboard" replace />;

  return children;
}
