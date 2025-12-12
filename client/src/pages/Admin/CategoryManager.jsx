import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoryForm from "../../components/CategoryForm";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      window.toast(" Lỗi tải danh mục", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.toast("Đã xóa danh mục", "info");
      fetchCategories();
    } catch (err) {
      console.error(err);
      window.toast(" Lỗi khi xóa", "error");
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2 cursor-pointer text-green-700 hover:text-green-900" onClick={() => navigate("/admin/products")}>
        <ArrowLeft size={28} />
        <span className="text-base font-medium">Quay lại danh sách sản phẩm</span>
      </div>


      {/* Tìm kiếm & thêm */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white shadow-sm">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Tìm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-60"
          />
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <PlusCircle size={18} /> Thêm danh mục
        </button>
      </div>

      {/* Bảng danh mục */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white text-left">
              <tr>
                <th className="p-3">Tên danh mục</th>
                <th className="p-3">Mô tả</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    Không có danh mục nào.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.description}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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

      {/* Form thêm/sửa */}
      {showForm && (
        <CategoryForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSave={fetchCategories}
        />
      )}
    </div>
  );
}

export default CategoryManager;
