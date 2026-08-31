import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ adminOnly = false }) {
  const { user } = useAuth(),
    loc = useLocation();
  if (!user)
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (adminOnly && user.role !== "ADMIN")
    return <Navigate to="/products" replace />;
  return <Outlet />;
}
