import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Pencil } from "lucide-react";
import Toast from "../components/Toast";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
  oldPassword: "",
  newPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);


  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
        setToast({ type: "error", message: "Không thể tải thông tin người dùng." });
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put("api/user/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ type: "success", message: "✅ Thông tin đã được cập nhật!" });
      localStorage.setItem("user", JSON.stringify({ ...form }));
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      setToast({ type: "error", message: "Không thể cập nhật. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      await axios.post("api/user/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setToast({ type: "success", message: "✅ Ảnh đại diện đã được cập nhật!" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Lỗi cập nhật avatar:", error);
      setToast({ type: "error", message: "Không thể cập nhật ảnh đại diện." });
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("api/user/change-password", {
        email: form.email,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setToast({ type: "success", message: "🔒 Mật khẩu đã được đổi thành công!" });
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      setToast({ type: "error", message: error.response?.data?.error || "Không thể đổi mật khẩu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-green-100">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <img
              src={form.avatar}
              alt="Avatar"
              className="w-40 h-40 rounded-full object-cover border-4 border-green-200"
            />
            <button
              type="button"
              onClick={() => document.getElementById("avatarInput").click()}
              className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:bg-green-100"
              title="Đổi ảnh đại diện"
            >
              <Pencil size={18} className="text-green-600" />
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatarInput"
            />
          </div>

          {/* Nút đổi mật khẩu */}
          <button
            type="button"
            onClick={() => setChangingPassword(true)}
            className="text-sm text-green-600 underline"
          >
            Đổi mật khẩu
          </button>
        </div>

          
          {/* Form thông tin */}
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-green-700 mb-2">Hồ sơ cá nhân</h2>
            <p className="text-sm text-gray-500 mb-6">
              Cập nhật thông tin liên hệ và địa chỉ của bạn.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Họ tên</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                  placeholder="0987xxxxxx"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                  placeholder="Phong Thanh Tây B, Cà Mau"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg text-white font-medium ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                } flex items-center justify-center`}
              >
                {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                Cập nhật thông tin
              </button>
              

            </form>
            {changingPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0  bg-opacity-40 backdrop-blur-sm"
                onClick={() => setChangingPassword(false)}
              />

              {/* Form*/}
              <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-green-200 z-10">
                <button
                  onClick={() => setChangingPassword(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold text-green-700 mb-4">Đổi mật khẩu</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))
                      }
                      className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                      placeholder="Nhập mật khẩu cũ"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                      }
                      className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-lg text-white font-medium ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    } flex items-center justify-center`}
                  >
                    {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                    Đổi mật khẩu
                  </button>
                </form>
              </div>
            </div>
)}



          </div>
        </div>
      </div>

      {/* Toast hiển thị thông báo */}
      {toast && (
        <div className="fixed top-20 right-5 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}

export default Profile;
