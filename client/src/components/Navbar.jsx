import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, Leaf } from "lucide-react";
import { useState, useContext } from "react";
import { useCart } from "../hooks/useCart";
import { UserContext } from "../context/UserContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, setUser } = useContext(UserContext);

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/products", label: "Sản phẩm" },
    ...(user ? [{ path: "/my-orders", label: "Đơn hàng của tôi" }] : []),
     { path: "/about", label: "Giới thiệu" },
    { path: "contact-scroll", label: "Liên hệ" }
  ];

  const handleProfileClick = () => {
    setMenuOpen(false); 
    navigate(user ? "/profile" : "/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.toast("Đã đăng xuất thành công 👋", "info");
    setMenuOpen(false);
    navigate("/");
  };

  const scrollToContact = () => {
    navigate("/");
    setMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <header className=" from-green-50 to-white shadow-md bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:py-4">
        
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 group select-none"
        >
          {/* Icon badge */}
          <div className="h-10 w-10 rounded-2xl  from-emerald-600 to-lime-500
                          flex items-center justify-center shadow-md ring-1 ring-emerald-200/60
                          group-hover:scale-105 transition">
            
          <img src="/logo.png" alt="Logo Mekong Fruit" className="h-full w-full object-cover" />
          </div>

          {/* Wordmark */}
          <div className="leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tracking-tight text-emerald-800">
                Mekong
              </span>
              <span className="text-xl font-extrabold tracking-tight text-lime-600">
                Fruit
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
          {navLinks.map((link) =>
            link.path === "contact-scroll" ? (
              <button
                key={link.label}
                onClick={scrollToContact}
                className="relative group transition text-gray-700 hover:text-green-700"
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0 bg-green-700 transition-all group-hover:w-full"></span>
              </button>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className="relative group transition text-gray-700 hover:text-green-700"
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0  bg-green-700 transition-all group-hover:w-full"></span>
              </Link>
            )
          )}

          {/* Giỏ hàng */}
          <button
            onClick={() => navigate("/cart")}
            className="relative text-green-700 hover:text-green-800 transition"
          >
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 rounded-full">
                {cartItems.length}
              </span>
            )}
          </button>

          {/*Profile */}
          <div
            onClick={handleProfileClick}
            className="ml-3 cursor-pointer flex items-center space-x-2 hover:opacity-90"
          >
            {user ? (
              <>
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  className="h-9 w-9 rounded-full border border-green-300 object-cover"
                />
                <span className="text-sm font-semibold text-green-700">
                  {user.name}
                </span>
              </>
            ) : (
              <div className="bg-green-100 p-2 rounded-full text-green-700">
                <User size={20} />
              </div>
            )}
          </div>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="ml-4 text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition"
            >
              Đăng xuất
            </button>
          )}
        </nav>

        {/*Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-green-700 hover:text-green-800 transition"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/*Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t animate-slideDown px-4 py-4 space-y-3">
          {navLinks.map((link) =>
            link.path === "contact-scroll" ? (
              <button
                key={link.label}
                onClick={scrollToContact}
                className="block w-full text-left text-gray-700 py-2 font-medium hover:text-green-700"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="block w-full text-gray-700 py-2 font-medium hover:text-green-700"
              >
                {link.label}
              </Link>
            )
          )}

          {/*Giỏ hàng */}
          <button
            onClick={() => {
              navigate("/cart");
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 text-gray-700 py-2 hover:text-green-700"
          >
            <ShoppingCart size={20} />
            Giỏ hàng
            {cartItems.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 rounded-full">
                {cartItems.length}
              </span>
            )}
          </button>

          {/*Profile */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 py-2 hover:text-green-700"
          >
            {user ? (
              <>
                <img
                  src={user.avatar || "/default-avatar.png"}
                  className="h-8 w-8 rounded-full border object-cover"
                />
                <span className="font-medium">{user.name}</span>
              </>
            ) : (
              <>
                <User size={20} />
                <span>Đăng nhập</span>
              </>
            )}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-600 py-2 rounded-md font-semibold hover:bg-red-200 mt-2"
            >
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
