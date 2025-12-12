import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Nếu chưa đăng nhập
  if (!token) {
    window.toast("🚫 Bạn cần đăng nhập trước!", "error");
    return <Navigate to="/login" replace />;
  }

  // Nếu không phải admin hoặc staff
  if (user.role !== "admin" && user.role !== "staff") {
    window.toast("⚠️ Bạn không có quyền truy cập trang quản trị!", "warning");
    return <Navigate to="/" replace />;
  }

  // Nếu hợp lệ => hiển thị layout admin
  return <Outlet />;
}

export default AdminRoute;
