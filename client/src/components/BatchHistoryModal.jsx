import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination"; 

export default function BatchHistoryModal({ batchId, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1); 

    axios
      .get(`/api/batch/${batchId}/movements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((res) => setMovements(res.data.movements || []))
      .catch(() => {
        window.toast("Không thể tải lịch sử lô hàng", "error");
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  // Tính tổng số trang
  const totalPages = Math.ceil(movements.length / itemsPerPage);

  // Lấy dữ liệu theo trang
  const paginatedData = movements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 sm:p-6 relative max-h-screen overflow-y-auto animate-fadeIn">

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-green-700 mb-4">
          Lịch sử lô hàng #{batchId}
        </h2>

        {loading ? (
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        ) : movements.length === 0 ? (
          <p className="text-gray-500 italic">Không có lịch sử nhập/xuất cho lô này.</p>
        ) : (
          <>
            <table className="w-full text-sm border border-gray-200 rounded shadow">
              <thead className="bg-green-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">Thời gian</th>
                  <th className="p-3 text-left">Loại</th>
                  <th className="p-3 text-left">Số lượng</th>
                  <th className="p-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((m, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="p-3">{new Date(m.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-3 capitalize">
                      {m.type === "import" ? "Nhập" : "Xuất"}
                    </td>
                    <td className="p-3">{m.quantity}</td>
                    <td className="p-3">{m.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PHÂN TRANG */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
}
