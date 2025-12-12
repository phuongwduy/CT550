import React, { useEffect, useState } from "react";
import CustomDropdown from "./CustomDropdown";

function AddressModal({ form, setForm, handleSave, handleDelete, onClose }) {
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);

  useEffect(() => {
    fetch("/api/provinces")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  useEffect(() => {
    if (!form.province_code) return;

    fetch(`/api/communes/${form.province_code}`)
      .then((res) => res.json())
      .then((data) => setCommunes(data));
  }, [form.province_code]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "province_code") {
      setForm((prev) => ({ ...prev, commune_code: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-3xl"
        >
          ×
        </button>

        <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
          {form.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Tên người nhận */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tên người nhận</label>
            <input
              type="text"
              name="receiver_name"
              value={form.receiver_name || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="VD: 0912345678"
              required
            />
          </div>

          {/* Tỉnh / Thành phố */}
          <div>
            <CustomDropdown
              label="Tỉnh / Thành phố"
              value={form.province_code}
              onChange={(val) => setForm({ ...form, province_code: val, commune_code: "" })}
              options={provinces}
              placeholder="-- Chọn tỉnh --"
              required
            />


          </div>

          {/* Xã / Phường */}
          <div>
            <CustomDropdown
                label="Xã / Phường"
                value={form.commune_code}
                onChange={(val) => setForm({ ...form, commune_code: val })}
                options={communes}
                placeholder="-- Chọn xã/phường --"
                disabled={!form.province_code}
                required
              />
          </div>

          {/* Địa chỉ chi tiết */}
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Địa chỉ chi tiết</label>
            <input
              type="text"
              name="detail"
              value={form.detail || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Số nhà, tên đường…"
              required
            />
          </div>

          {/* Mặc định */}
          <div className="flex items-center gap-2 col-span-1 md:col-span-2 mt-2">
            <input
              type="checkbox"
              name="is_default"
              checked={!!form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
          </div>
        </div>

        {/* Action buttons */}
       <div className="mt-8 flex gap-4">
        {form.id && (
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium shadow-sm transition"
          >
            Xóa địa chỉ
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium shadow-sm transition"
        >
          {form.id ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
        </button>
      </div>

      </div>
    </div>
  );
}

export default AddressModal;
