import { useState } from "react";
import axios from "axios";

function UnitForm({ editing, onClose, onSave }) {
  const [form, setForm] = useState(editing || { name: "" });
  const token = localStorage.getItem("token");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      window.toast("Tên đơn vị là bắt buộc", "error");
      return;
    }

    try {
      if (editing) {
        await axios.put(
          `/api/units/${editing.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.toast("Đã cập nhật đơn vị", "success");
      } else {
        await axios.post("/api/units", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.toast("Đã thêm đơn vị", "success");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi lưu đơn vị", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 relative pointer-events-auto animate-fade-in"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <h2 className="text-lg font-semibold mb-4 text-green-700">
          {editing ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Tên đơn vị (vd: kg, trái...)"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
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

export default UnitForm;
