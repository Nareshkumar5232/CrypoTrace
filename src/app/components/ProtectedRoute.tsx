import { Navigate, Outlet } from"react-router";

export function ProtectedRoute() {
 const isAuthenticated = localStorage.getItem('authUser');

 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 return <Outlet />;
}
