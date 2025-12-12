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
import UnitForm from "../../components/UnitForm";

function UnitsManager() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUnits = useCallback(async () => {
    try {
      const res = await axios.get("/api/units", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(res.data);
    } catch (err) {
      console.error(err);
      window.toast("Lỗi tải đơn vị", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa đơn vị này?")) return;
    try {
      await axios.delete(`/api/units/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.toast("Đã xóa đơn vị", "info");
      fetchUnits();
    } catch (err) {
      console.error(err);
      window.toast(err.response?.data?.message || "Lỗi khi xóa", "error");
    }
  };

  const filtered = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Tìm đơn vị..."
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
          <PlusCircle size={18} /> Thêm đơn vị
        </button>
      </div>

      {/* Bảng đơn vị */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-green-700 text-white text-left">
              <tr>
                <th className="p-3">Tên đơn vị</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-gray-500">
                    Không có đơn vị nào.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setEditing(u);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
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
        <UnitForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSave={fetchUnits}
        />
      )}
    </div>
  );
}

export default UnitsManager;
