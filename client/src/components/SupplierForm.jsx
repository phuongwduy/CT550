import { useState } from "react";
import axios from "axios";

function SupplierForm({ onClose, onSave, editing }) {
  const [form, setForm] = useState(
    editing || {
      name: "",
      email: "",
      phone: "",
      address: "",
    }
  );

  const token = localStorage.getItem("token");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };

      if (editing) {
        await axios.put(
          `/api/suppliers/${editing.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.toast("Cập nhật nhà cung cấp thành công", "success");
      } else {
        await axios.post("/api/suppliers", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.toast("Thêm nhà cung cấp thành công", "success");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Lỗi khi lưu nhà cung cấp:", err.response?.data || err.message);
      window.toast("Lỗi khi lưu nhà cung cấp", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 relative pointer-events-auto animate-fade-in"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h2 className="text-lg font-semibold mb-4 text-green-700">
          {editing ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Tên nhà cung cấp"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            name="address"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            >
              {editing ? "Lưu thay đổi" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupplierForm;
