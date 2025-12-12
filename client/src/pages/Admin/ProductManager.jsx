import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Pencil, Trash2, PlusCircle, Search, Box, Boxes, SquareStack } from "lucide-react";
import ProductForm from "../../components/ProductForm";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      window.toast("Lỗi tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.toast("Xóa sản phẩm thành công", "info");
      fetchProducts();
    } catch (err) {
      console.error(err);
      window.toast(" Lỗi khi xóa sản phẩm", "error");
    }
  };

 // Lọc theo từ khóa
const filtered = products.filter(
  (p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.province.toLowerCase().includes(search.toLowerCase())
);

// Sắp xếp theo phân loại để các sản phẩm cùng loại nằm gần nhau
const sorted = filtered.sort((a, b) =>
  a.category_name.localeCompare(b.category_name)
);

// Phân trang
const totalPages = Math.ceil(sorted.length / itemsPerPage);

const paginated = sorted.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  return (
    <div className="p-4 relative">
      {/* Thanh tìm kiếm và nút thêm */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1); 
          }}
          placeholder="Tìm theo tên hoặc tỉnh..."
        />
        <div className="flex gap-2">
          <button
          onClick={() => navigate("/admin/categories")}
          className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg shadow transition">
          <SquareStack size={18} /> Quản lý phân loại
          </button>
          <button
            onClick={() => navigate("/admin/units")}
            className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg shadow transition"
          >
            <Boxes size={18} /> Quản lý đơn vị
          </button>
        </div>
        

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <PlusCircle size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* Bảng sản phẩm */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white text-left">
              <tr>
                <th className="p-3">Hình</th>
                <th className="p-3">Tên sản phẩm</th>
                <th className="p-3">Giá Nhập(VNĐ)</th>
                <th className="p-3">Giá Bán(VNĐ)</th>
                <th className="p-3">Tồn kho</th>
                <th className="p-3">Đơn vị</th>
                <th className="p-3">Phân loại</th>
                <th className="p-3">Xuất xứ</th>
                <th className="p-3">Nhà cung cấp</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-500">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-14 w-14 object-cover rounded"
                      />
                    </td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-green-700 font-semibold">
                      {Number(p.import_price).toLocaleString()}
                    </td>
                    <td className="p-3 text-green-700 font-semibold">
                      {Number(p.price).toLocaleString()}
                    </td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">{p.unit_name || "—"}</td>
                    <td className="p-3">{p.category_name}</td>
                    <td className="p-3">{p.province}</td>
                    <td className="p-3">{p.supplier_name || "—"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800"
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
      )}

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Form thêm/sửa */}
      {showForm && (
        <ProductForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
}

export default ProductManager;

