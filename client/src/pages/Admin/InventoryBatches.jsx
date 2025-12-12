import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Pagination from "../../components/Pagination"; 

export default function InventoryOverview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get("/api/inventory/overview", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setProducts(res.data))
      .catch(() => {
        window.toast("Không thể tải dữ liệu kho", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500 animate-pulse">
        Đang tải dữ liệu...
      </div>
    );

  
  const sortedProducts = [...products].sort((a, b) => { 
  if (!a.supplier && b.supplier) return 1;
  if (a.supplier && !b.supplier) return -1;
  if (!a.supplier && !b.supplier) return 0;
  
  return a.supplier.localeCompare(b.supplier);
});

// Tính tổng trang
const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

// Cắt mảng theo trang
const paginated = sortedProducts.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  return (
    <div className="p-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-green-700 text-white text-left">
            <tr>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3 text-center">Tồn kho</th>
              <th className="p-3 text-center">Đơn vị</th>
              <th className="p-3 text-center">Nhà cung cấp</th>
              <th className="p-3 text-center">Chi tiết</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Không có sản phẩm nào.
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{p.name}</td>
                  <td className="p-3 text-center">{p.stock}</td>
                  <td className="p-3 text-center">{p.unit || "(chưa có)"}</td>
                  <td className="p-3 text-center">{p.supplier || "(chưa có)"}</td>
                  <td className="p-3 text-center">
                    <Link
                      to={`/admin/inventory/product/${p.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Xem lô hàng
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
