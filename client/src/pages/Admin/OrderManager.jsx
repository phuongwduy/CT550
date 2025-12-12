import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const itemsPerPage = 8;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      window.toast("Không thể tải đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `/api/admin/orders/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.toast("Cập nhật trạng thái thành công", "success");
      fetchOrders();
    } catch (err) {
      
      const msg = err?.response?.data?.message;

      if (!msg) {
        return window.toast("Không thể cập nhật trạng thái", "error");
      }

      if (msg.includes("Không thể chuyển")) {
        window.toast(`${msg}`, "warning");
      } else if (msg.includes("không đủ tồn kho")) {
       window.toast("Không thể cập nhật trạng thái do tồn kho không đủ.", "error");
      } else {
        window.toast(`${msg}`, "error");
      }
    }

  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Tìm mã đơn hoặc tên người nhận..."
        />
        <div>
         <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-300"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="packing">Đang đóng gói</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
          <option value="returned">Hoàn hàng</option>
        </select>
      </div>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white text-left">
              <tr>
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Người đặt</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                paginated.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{o.order_code}</td>
                    <td className="p-3">{o.user_name || "Ẩn"}</td>
                    <td className="p-3 text-green-700 font-semibold">
                      {Number(o.total_price).toLocaleString()}₫
                    </td>
                    <td className="p-3">
                      {(() => {
                        const allStatuses = [
                          { value: "pending", label: "Chờ xác nhận" },
                          { value: "confirmed", label: "Đã xác nhận" },
                          { value: "packing", label: "Đang đóng gói" },
                          { value: "shipping", label: "Đang giao" },
                          { value: "delivered", label: "Đã giao" },
                          { value: "cancelled", label: "Đã hủy" },
                        ];

                        const transitions = {
                          pending: ["confirmed", "cancelled"],
                          confirmed: ["packing", "cancelled"],
                          packing: ["shipping", "cancelled"],
                          shipping: ["delivered"],
                          delivered: [],                
                          cancelled: []
                        };

                        const nextAllowed = transitions[o.status] || [];
                        const visibleOptions = allStatuses.filter(
                          s => s.value === o.status || nextAllowed.includes(s.value)
                        );

                      
                        return (
                          <div className="relative inline-block w-[150px]">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            disabled={nextAllowed.length === 0}
                            className={`appearance-none w-full px-3 py-1.5 pr-7 rounded-md text-sm font-semibold cursor-pointer border shadow-sm
                              transition-all duration-200 focus:ring-2 focus:ring-offset-1
                              ${
                                o.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-400"
                                  : o.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-400"
                                  : o.status === "packing"
                                  ? "bg-purple-100 text-purple-800 border-purple-300 focus:ring-purple-400"
                                  : o.status === "shipping"
                                  ? "bg-indigo-100 text-indigo-800 border-indigo-300 focus:ring-indigo-400"
                                  : o.status === "delivered"                             
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 focus:ring-emerald-400"
                                  : o.status === "cancelled"
                                  ? "bg-gray-200 text-gray-800 border-gray-300 focus:ring-gray-400"
                                  : "bg-gray-100 text-gray-700 border-gray-300"
                              }`}
                          >
                            {visibleOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {/* Icon mũi tên nhỏ bên phải */}
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 text-xs">
                            ▼
                          </span>
                        </div>

                        );
                      })()}
                    </td>

                    <td className="p-3">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default OrderManager;
