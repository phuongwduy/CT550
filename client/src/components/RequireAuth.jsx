import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Navigate } from "react-router-dom";

function RequireAuth({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) return null; // hoặc spinner nếu muốn

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default RequireAuth;
