import { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

export default function InventoryTicketList() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("/api/inventory/tickets", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setTickets(res.data))
      .catch(err => {
        console.error("Lỗi lấy danh sách phiếu:", err);
         window.toast("Không thể tải danh sách phiếu kho", "error");
      });
  }, [token]);

  // Reset về trang 1 khi tìm kiếm hoặc lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const viewDetails = async (id) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(`/api/inventory/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelected(id);
      setSelectedTicket(res.data.ticket);
      setDetails(res.data.items);
    } catch (err) {
      console.error("Lỗi lấy chi tiết phiếu:", err);
       window.toast("Không thể tải chi tiết phiếu kho", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND"
    });
  };

  // Lọc dữ liệu
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || t.type === filterType;

    return matchesSearch && matchesType;
  });

  // Tính phân trang
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      {/* Tìm kiếm & lọc */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <SearchBar
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
          placeholder="Tìm theo ghi chú, người tạo, nhà cung cấp..."
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
        >
          <option value="all">Tất cả loại phiếu</option>
          <option value="import">Phiếu nhập</option>
          <option value="export">Phiếu xuất</option>
        </select>
      </div>

      {/* Bảng danh sách */}
      <div className="overflow-x-auto">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Người tạo</th>
                <th className="p-3">Nhà cung cấp</th>
                <th className="p-3">Ghi chú</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    Không có phiếu kho nào.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{t.id}</td>

                    <td className="p-3 font-semibold">
                      {t.type === "import" ? (
                        <span className="text-green-700">Nhập kho</span>
                      ) : (
                        <span className="text-red-700">Xuất kho</span>
                      )}
                    </td>

                    <td className="p-3">{t.user_name}</td>
                    <td className="p-3">{t.supplier_name || "-"}</td>
                    <td className="p-3">{t.note || "-"}</td>

                    <td className="p-3">{formatDate(t.created_at)}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          t.status === "active"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                      >
                        {t.status === "active" ? "Hoạt động" : "Đã hủy"}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => viewDetails(t.id)}
                        className="text-blue-600 hover:text-blue-800 items-center gap-1"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {/* PHÂN TRANG */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal chi tiết phiếu */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6 border border-green-100 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-lg font-bold text-green-700 mb-4">
              📦 Chi tiết phiếu #{selected}
            </h3>

            {loadingDetails ? (
              <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500">Loại phiếu:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {selectedTicket?.type === "import" ? "Nhập" : "Xuất"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Người tạo:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {selectedTicket?.user_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Nhà cung cấp:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {selectedTicket?.supplier_name || "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Ngày tạo:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {formatDate(selectedTicket?.created_at)}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-gray-500">Ghi chú:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {selectedTicket?.note || "Không có"}
                    </span>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-2 text-left">Sản phẩm</th>
                        <th className="p-2 text-center">Số lượng</th>
                        {selectedTicket?.type === "import" && (
                          <th className="p-2 text-right">Giá nhập</th>
                        )}
                        <th className="p-2 text-right">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((d) => (
                        <tr key={d.id} className="border-t">
                          <td className="p-2">{d.product_name}</td>
                          <td className="p-2 text-center">{d.quantity}</td>

                          {selectedTicket?.type === "import" && (
                            <td className="p-2 text-right">
                              {formatPrice(d.import_price)}
                            </td>
                          )}

                          <td className="p-2 text-right">
                            {selectedTicket?.type === "import"
                              ? formatPrice(d.quantity * d.import_price)
                              : `${d.quantity}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tổng tiền nếu nhập */}
                {selectedTicket?.type === "import" && (
                  <div className="text-right mt-4 text-sm font-semibold text-green-700">
                    Tổng tiền:{" "}
                    {formatPrice(
                      details.reduce(
                        (sum, d) => sum + d.import_price * d.quantity,
                        0
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
