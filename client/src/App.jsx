import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastContainer from "./components/ToastContainer";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./providers/CartProvider";
import CartSidebar from "./components/CartSidebar";
import { UserProvider } from "./providers/UserProvider";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import ForgotPassword from "./components/ForgotPassword"
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import PaypalsSuccess from "./pages/PaypalSuccessPage";
import ChatBot from "./components/ChatBot";
import About  from "./pages/About";
// Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ProductManager from "./pages/Admin/ProductManager";
import OrderManager from "./pages/Admin/OrderManager";
import OrderDetail from "./pages/Admin/OrderDetail";
import UserManager from "./pages/Admin/UserManager";
import CategoryManager from "./pages/Admin/CategoryManager";
import CommentManager from "./pages/Admin/CommentManager";
import CommentReplies from "./components/CommentReplies";
import SuppliersManager from "./pages/Admin/SuppliersManager";
import UnitsManager from "./pages/Admin/UnitsManager";  
import InventoryListPage from "./pages/Admin/InventoryListPage";
import InventoryCreatePage from "./pages/Admin/InventoryCreatePage";
import RequireAuth from "./components/RequireAuth";
import Coupons from "./pages/Admin/CouponManager"
import InventoryBatches from "./pages/Admin/InventoryBatches";
import ProductBatchDetails from "./pages/Admin/ProductBatchDetails";

import ScrollToTop from "./components/ScrollToTop";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ToastContainer />
      <CartSidebar />
      {!isAdminRoute && <Navbar />}

      <main className={` ${!isAdminRoute ? "container mx-auto px-4 py-6" : ""} bg-green-50 text-gray-800 min-h-screen`}>
        <Routes>
          {/* Trang người dùng */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order_success/:orderId" element={<OrderSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/my-orders/:id" element={<OrderDetailPage />} />
          <Route path="/paypal-success" element={<PaypalsSuccess />} />
          {/* Trang quản trị */}
         <Route path="/admin" element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="users" element={<UserManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="comments" element={<CommentManager />} />
            <Route path="comments/:id" element={<CommentReplies />} />
            <Route path="suppliers" element={<SuppliersManager />} />
            <Route path="units" element={<UnitsManager />} />
            <Route path="inventory/list" element={<InventoryListPage />} />
            <Route path="inventory/create" element={<InventoryCreatePage />} />
            <Route path="inventory/batches" element={<InventoryBatches />} />
            <Route path="inventory/product/:id" element={<ProductBatchDetails />} />
            <Route path="coupons" element={<Coupons />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatBot />}
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <CartProvider>
          <AppContent />
        </CartProvider>
      </Router>
    </UserProvider>
  );
}


export default App;
