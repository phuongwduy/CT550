import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Box, ShoppingCart, Users, LogOut, User, MessageCircle, Container, Factory, Tag  } from "lucide-react";
import { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.toast("Đã đăng xuất!", "info");
    setUser(null);
    navigate("/login");
  };




  const pageTitles = {
    "/admin": "Tổng quan",
    "/admin/products": "Quản lý sản phẩm",
    "/admin/suppliers": "Quản lý nhà cung cấp",
    "/admin/orders": "Quản lý đơn hàng",
    "/admin/users": "Quản lý người dùng",
    "/admin/categories": "Quản lý danh mục",
    "/admin/units": "Quản lý đơn vị",
    "/admin/comments": "Quản lý bình luận",
    "/admin/comments/:id": "Phản hồi bình luận",
    "/admin/inventory/list": "Danh sách phiếu kho",
    "/admin/inventory/create": "Tạo phiếu nhập/xuất kho",
    "/admin/inventory/batches": "Danh sách lô hàng sản phẩm",
    "/admin/coupons": "Giảm giá",
    "/admin/inventory/product/:id": "Chi tiết lô hàng sản phẩm",  
  };
const menus = {
  admin: [
    { path: "/admin", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/admin/products", label: "Sản phẩm", icon: Box },
    { path: "/admin/suppliers", label: "Nhà cung cấp", icon: Factory },
    { path: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
    { path: "/admin/users", label: "Người dùng", icon: Users },
    { path: "/admin/comments", label: "Bình luận", icon: MessageCircle },
    { path: "/admin/coupons", label: "Giảm giá", icon: Tag },
    { 
      label: "Kho", icon: Container, children: [
        { path: "/admin/inventory/batches", label: "Danh sách lô sản phẩm" },
        { path: "/admin/inventory/list", label: "Danh sách phiếu kho" },
        { path: "/admin/inventory/create", label: "Tạo phiếu nhập/xuất kho" },
      ]
    },
  ],
  staff: [
    { path: "/admin", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/admin/products", label: "Sản phẩm", icon: Box },
    { path: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
    { 
      label: "Kho", icon: Container, children: [
        { path: "/admin/inventory/batches", label: "Danh sách lô sản phẩm" },
        { path: "/admin/inventory/list", label: "Danh sách phiếu kho" },
        { path: "/admin/inventory/create", label: "Tạo phiếu nhập/xuất kho" },
      ]
    },
  ]
};

  function getPageTitle(pathname) {
    for (const pattern in pageTitles) {
      const regex = new RegExp("^" + pattern.replace(/:\w+/g, "[^/]+") + "$");
      if (regex.test(pathname)) {
        return pageTitles[pattern];
      }
    }
    return "Trang quản trị";
  }

  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 bg-green-700 text-white p-5 flex flex-col no-print">
          <h2 className="text-xl font-bold mb-6">MekongFruit Admin</h2>

          <nav className="flex-1 space-y-2 text-sm">
            {menus[user?.role]?.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() => setInventoryOpen(!inventoryOpen)}
                    className="flex items-center gap-2 p-2 w-full text-left rounded transition hover:bg-green-800"
                  >
                    <item.icon size={18} /> {item.label}
                    <span className="ml-auto">{inventoryOpen ? "▾" : "▸"}</span>
                  </button>
                  {inventoryOpen && (
                    <div className="ml-9 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `block p-2 rounded text-sm ${
                              isActive ? "bg-green-900" : "hover:bg-green-800"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded transition ${
                      isActive ? "bg-green-900" : "hover:bg-green-800"
                    }`
                  }
                >
                  {item.icon && <item.icon size={18} />}
                  {item.label}
                </NavLink>
              )
            )}
          </nav>


          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2 mt-4"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center no-print">
          <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          🌿 {currentTitle}
        </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-green-100 px-2 py-1 rounded text-green-700"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <User size={20} className="text-green-600" />
              <span className="text-gray-700 font-medium">
                {user?.name || "Quản trị viên"}
              </span>
            </div>
          </div>
        </header>

        {/* Nội dung trang con */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
