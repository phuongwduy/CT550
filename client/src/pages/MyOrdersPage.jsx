import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Leaf
} from "lucide-react";
import axios from "axios";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
        setFilteredOrders(res.data);
      })
      .catch(() => {
        window.toast("Không thể tải danh sách đơn hàng.", "error");
      });
  }, [token]);

  const statusInfo = {
    pending: {
      label: "Chờ xác nhận",
      color: "text-yellow-700 bg-yellow-100",
      left: "border-l-yellow-500",
      icon: Clock,
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "text-blue-700 bg-blue-100",
      left: "border-l-blue-500",
      icon: CheckCircle,
    },
    packing: {
      label: "Đang đóng gói",
      color: "text-blue-700 bg-blue-100",
      left: "border-l-blue-500",
      icon: Package,
    },
    shipping: {
      label: "Đang giao",
      color: "text-indigo-700 bg-indigo-100",
      left: "border-l-indigo-500",
      icon: Truck,
    },
    delivered: {
      label: "Đã giao",
      color: "text-green-700 bg-green-100",
      left: "border-l-green-600",
      icon: CheckCircle,
    },
    completed: {
      label: "Hoàn tất",
      color: "text-green-700 bg-green-100",
      left: "border-l-green-600",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Đã hủy",
      color: "text-red-700 bg-red-100",
      left: "border-l-red-600",
      icon: XCircle,
    },
    returned: {
      label: "Hoàn trả",
      color: "text-gray-700 bg-gray-200",
      left: "border-l-gray-400",
      icon: XCircle,
    },
  };

  const filterOptions = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "packing", label: "Đang đóng gói" },
    { key: "shipping", label: "Đang giao" },
    { key: "delivered", label: "Đã giao" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  const handleFilter = (key) => {
    setActiveFilter(key);
    setFilteredOrders(key === "all" ? orders : orders.filter((o) => o.status === key));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;

    try {
      await axios.patch(
        `/api/orders/${orderId}`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.toast("Đã hủy đơn hàng thành công!", "success");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      window.toast(
        err.response?.data?.message || "Không thể hủy đơn hàng.",
        "error"
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
     <h1 className="text-3xl font-bold mb-8 text-green-700 text-center flex items-center justify-center gap-2">
      <Package size={28} className="text-green-600" />
      Đơn hàng của tôi
    </h1>

      {/* Bộ lọc */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeFilter === f.key
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Không có đơn */}
      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-600 py-10">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Không có đơn hàng nào trong mục này.</p>
          <Link
            to="/products"
            className="inline-block mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => {
            const info = statusInfo[order.status] || {};
            const Icon = info.icon || Package;

            return (
              <div
                key={order.id}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 ${info.left}`}
              >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start mb-5">
                  <div>
                    <p className="text-xs text-gray-500">Mã đơn hàng</p>
                    <p className="font-semibold text-lg text-green-700">
                      {order.order_code}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${info.color}`}
                  >
                    <Icon size={18} />
                    <span>{info.label || order.status}</span>
                  </div>
                </div>

                {/* Thumbnail */}
                {order.items?.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={order.items[0].product_image}
                      alt="SP"
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <p className="text-gray-700 text-sm line-clamp-1">
                      {order.items[0].product_name}{" "}
                      {order.items.length > 1 &&
                        `+ ${order.items.length - 1} sản phẩm khác`}
                    </p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700 mb-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Ngày đặt
                    </p>
                    <p>{new Date(order.created_at).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Tổng tiền
                    </p>
                    <p className="font-semibold text-red-600">
                      {Number(order.total_price).toLocaleString()}₫
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Trạng thái
                    </p>
                    <p>{info.label}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center border-t pt-4">
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    Cảm ơn bạn đã mua sắm tại{" "}
                    <span className="text-green-700 font-semibold">
                      MekongFruits
                    </span>{" "}
                    <Leaf size={16} className="text-green-600 inline-block" />
                  </p>


                  <div className="flex gap-2">
                    {["pending", "confirmed", "packing"].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        Hủy đơn
                      </button>
                    )}

                    <Link
                      to={`/my-orders/${order.id}`}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrdersPage;
