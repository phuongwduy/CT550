import { useState, useEffect } from "react";
import axios from "axios";

function CategoryForm({ editing, onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description || "");
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, description };
      if (editing) {
        await axios.put(`/api/categories/${editing.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.toast(" Cập nhật danh mục thành công", "success");
      } else {
        await axios.post(`/api/categories`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.toast(" Thêm danh mục thành công", "success");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi lưu danh mục", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-green-700">
          {editing ? "Sửa danh mục" : "Thêm danh mục"}
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tên danh mục *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded outline-none"
            placeholder="Ví dụ: Trái cây miền Tây"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border px-3 py-2 rounded outline-none resize-none"
            placeholder="Mô tả ngắn gọn về danh mục..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded"
          >
            {editing ? "Lưu" : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;
