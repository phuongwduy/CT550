import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  ArrowLeft,
} from "lucide-react";
import SupplierForm from "../../components/SupplierForm";

function SuppliersManager() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await axios.get("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
      window.toast("Lỗi tải nhà cung cấp", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa nhà cung cấp này?")) return;
    try {
      await axios.delete(`/api/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.toast("Đã xóa nhà cung cấp", "info");
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi xóa", "error");
    }
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      
      {/* Tìm kiếm & thêm */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white shadow-sm">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Tìm nhà cung cấp..."
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
          <PlusCircle size={18} /> Thêm nhà cung cấp
        </button>
      </div>

      {/* Bảng nhà cung cấp */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white text-left">
              <tr>
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">SĐT</th>
                <th className="p-3">Địa chỉ</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Không có nhà cung cấp nào.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.email || "-"}</td>
                    <td className="p-3">{s.phone || "-"}</td>
                    <td className="p-3">{s.address || "-"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setEditing(s);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
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
        <SupplierForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSave={fetchSuppliers}
        />
      )}
    </div>
  );
}

export default SuppliersManager;
