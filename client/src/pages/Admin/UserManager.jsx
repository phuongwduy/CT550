import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import Toast from "../../components/Toast";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import UserForm from "../../components/UserForm"; 

function UserManager() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
      setToast({ type: "error", message: "Không thể tải danh sách người dùng." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(
        `/api/admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ type: "success", message: "Đã cập nhật vai trò." });
      fetchUsers();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.error || "Không thể cập nhật vai trò." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: "success", message: "Đã xóa người dùng." });
      fetchUsers();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.error || "Không thể xóa người dùng." });
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
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
          placeholder="Tìm theo tên hoặc email..."
        />
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <PlusCircle size={18} /> Thêm người dùng
        </button>
      </div>

      {/*Bảng người dùng */}
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
                  <th className="p-3">Tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">SĐT</th>
                  <th className="p-3">Địa chỉ</th>
                  <th className="p-3">Vai trò</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      Không có người dùng.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-900">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.phone || "-"}</td>
                      <td className="p-3">{u.address || "-"}</td>

                      {/* Vai trò */}
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 rounded border shadow-sm focus:ring-2 focus:ring-green-300"
                        >
                          <option value="user">Người dùng</option>
                          <option value="staff">Nhân viên</option>
                          <option value="admin">Quản trị</option>
                        </select>
                      </td>

                      {/* Hành động */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition"
                          title="Xóa người dùng"
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

      {/*Form thêm người dùng */}
      {showForm && (
        <UserForm
          editing={editingUser}
          onClose={() => setShowForm(false)}
          onSave={() => {
            fetchUsers();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

export default UserManager;
