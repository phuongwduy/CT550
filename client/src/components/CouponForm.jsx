import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

function CouponForm({ editing, onClose, onSave }) {
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
    min_order: "",
    max_discount: "",
    expires_at: "",
    is_active: true,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code || "",
        discount_type: editing.discount_type || "percent",
        discount_value: editing.discount_value || "",
        min_order: editing.min_order || "",
        max_discount: editing.max_discount || "",
        expires_at: editing.expires_at ? editing.expires_at.slice(0, 10) : "",
        is_active: editing.is_active ?? true,
      });
    }
  }, [editing]);

 const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (["min_order", "max_discount", "discount_value"].includes(name)) {
      const raw = parseCurrency(value);
      setForm((prev) => ({
        ...prev,
        [name]: raw,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/coupons/${editing.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/coupons", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSave();
    } catch (err) {
      window.toast(err.response?.data?.error, "error");
      console.error("Lỗi lưu mã giảm giá:", err);
    }
  };
  const formatCurrency = (value) => {
  if (!value) return "";
    return Number(value).toLocaleString("vi-VN");
  };

  const parseCurrency = (value) => {
    return value.replace(/\D/g, ""); // Xóa mọi ký tự không phải số
  };

  return (
    <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Mã giảm giá</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Loại giảm</label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Giá trị giảm</label>
            <input
              type="text"
              name="discount_value"
              value={formatCurrency(form.discount_value)}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Đơn tối thiểu</label>
              <input
                type="text"
                name="min_order"
                value={formatCurrency(form.min_order)}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Giảm tối đa</label>
              <input
                type="text"
                name="max_discount"
                value={formatCurrency(form.max_discount)}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium">Ngày hết hạn</label>
            <input
              type="date"
              name="expires_at"
              value={form.expires_at}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <label className="font-medium">Đang hoạt động</label>
          </div>

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            {editing ? "Lưu thay đổi" : "Tạo mã"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CouponForm;
