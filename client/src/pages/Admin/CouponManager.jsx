import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Loader2, Trash2, PlusCircle, Pencil } from "lucide-react";
import Toast from "../../components/Toast";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import CouponForm from "../../components/CouponForm"; 

function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách mã giảm giá:", err);
      setToast({ type: "error", message: "Không thể tải danh sách mã giảm giá." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mã này?")) return;
    try {
      await axios.delete(`/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: "success", message: "Đã xóa mã giảm giá." });
      fetchCoupons();
    } catch (err) {
      console.error("Lỗi xóa mã:", err);
      setToast({ type: "error", message: "Không thể xóa mã giảm giá." });
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      {/*Thanh tìm kiếm + nút thêm */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo mã giảm giá..."
        />
        <button
          onClick={() => {
            setEditingCoupon(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <PlusCircle size={18} /> Thêm mã giảm giá
        </button>
      </div>

      {/*Bảng mã giảm giá */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-6 w-6 text-green-600" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-green-700 text-white text-left">
                <tr>
                  <th className="p-3">Mã</th>
                  <th className="p-3">Loại</th>
                  <th className="p-3">Giá trị</th>
                  <th className="p-3">Tối thiểu (VND)</th>
                  <th className="p-3">Giảm tối đa (VND)</th>
                  <th className="p-3">Hết hạn</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      Không có mã giảm giá nào.
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{c.code}</td>
                      <td className="p-3">{c.discount_type}</td>
                      <td className="p-3">{c.discount_value}%</td>
                      <td className="p-3">
                        {c.min_order ? Number(c.min_order).toLocaleString() : "-"}
                      </td>
                      <td className="p-3">
                        {c.max_discount ? Number(c.max_discount).toLocaleString() : "-"}
                      </td>
                      <td className="p-3">
                        {c.expires_at
                          ? new Date(c.expires_at).toLocaleDateString("vi-VN")
                          : "-"}
                      </td>

                      <td className="p-3">
                        {c.is_active ? (
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-300">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 border border-red-300">
                            Tắt
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setEditingCoupon(c);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>


          {/*Phân trang */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/*Toast thông báo */}
      {toast && (
        <div className="fixed top-20 right-5 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/*Form thêm/sửa mã giảm giá */}
      {showForm && (
        <CouponForm
          editing={editingCoupon}
          onClose={() => setShowForm(false)}
          onSave={() => {
            fetchCoupons();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

export default CouponManager;
