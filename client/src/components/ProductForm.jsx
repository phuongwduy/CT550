import { useState, useEffect } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
function ProductForm({ onClose, onSave, editing }) {
  const [form, setForm] = useState(
    editing || {
      name: "",
      description: "",
      price: "",
      category_id: "",
      stock : "0",
      province: "",
      unit_id: "",
      image: "",
    }
  );

  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);

  const token = localStorage.getItem("token");
  const formattedPrice = form.price
  ? Number(form.price).toLocaleString("vi-VN")
  : "";

  // Lấy danh sách danh mục
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const res = await axios.get("/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(res.data);
          if (!editing && res.data.length > 0) {
            setForm((prev) => ({ ...prev, category_id: res.data[0].id }));
          }
        } catch (err) {
          console.error(err);
          window.toast("Lỗi tải danh mục", "error");
        }
      };

      const fetchSuppliers = async () => {
        try {
          const res = await axios.get("/api/suppliers", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSuppliers(res.data);
          if (!editing && res.data.length > 0) {
            setForm((prev) => ({ ...prev, supplier_id: res.data[0].id }));
          }
        } catch (err) {
          console.error(err);
          window.toast("Lỗi tải nhà cung cấp", "error");
        }
        
      };
      const fetchUnits = async () => {
        try {
          const res = await axios.get("/api/units", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUnits(res.data);
          if (!editing && res.data.length > 0) {
            setForm((prev) => ({ ...prev, unit_id: res.data[0].id }));
          }
        } catch (err) {
          console.error(err);
          window.toast("Lỗi tải đơn vị", "error");
        }
      };

      fetchCategories();
      fetchSuppliers();
      fetchUnits();
    }, [token, editing]);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Nén ảnh trước khi upload
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5, // còn khoảng 300–500KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("image", compressedFile);

      const res = await axios.post("/api/products/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setForm({ ...form, image: res.data.url, image_public_id: res.data.public_id });

      window.toast("Ảnh đã tải lên!", "success");
    } catch (err) {
      console.error("Upload error:", err);
      window.toast("Lỗi tải ảnh", "error");
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(
          `/api/products/${editing.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.toast("Cập nhật sản phẩm thành công", "success");
      } else {
        await axios.post("/api/products", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.toast("Thêm sản phẩm thành công", "success");
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi lưu sản phẩm", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-gray-200 relative pointer-events-auto animate-fade-in"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >

         <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4 text-green-700">
          {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thông tin cơ bản */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
            placeholder="Tên sản phẩm"
            required
          />
        </div>

        {/* Giá & Tồn kho */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
            <input
              name="price"
              type="text"
              inputMode="numeric"
              placeholder="Giá"
              value={formattedPrice}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setForm({ ...form, price: raw });
              }}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
            />
          </div> */}
        </div>

        {/* Danh mục & Nhà cung cấp */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
            <select
              name="supplier_id"
              value={form.supplier_id || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tỉnh & Đơn vị */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh</label>
            <select
              name="province"
              value={form.province}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- Chọn tỉnh --</option>
              {["Cà Mau","Cần Thơ","Vĩnh Long","Tây Ninh","An Giang","Đồng Tháp"].map((tinh) => (
                <option key={tinh} value={tinh}>{tinh}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
            <select
              name="unit_id"
              value={form.unit_id || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- Chọn đơn vị --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="Mô tả"
          />
        </div>

        {/* Upload ảnh */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ảnh sản phẩm
          </label>

          {/* Khung upload */}
          {!form.image ? (
            <label
              className="flex flex-col items-center justify-center w-full h-32 px-4
                        border-2 border-dashed border-gray-300 rounded-lg
                        cursor-pointer hover:border-green-500 hover:bg-green-50
                        transition duration-200"
            >
              <span className="text-gray-500 text-sm">Nhấn để chọn ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full">
              {/* Ảnh preview */}
              <img
                src={form.image}
                alt="preview"
                className="h-40 w-full object-cover rounded-lg shadow-md border"
              />

              {/* Nút đổi ảnh */}
              <label
                className="absolute bottom-2 right-2 bg-black/60 text-white
                          text-xs px-2 py-1 rounded cursor-pointer hover:bg-black/80"
              >
                Đổi ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

        {/* Loading */}
        {uploading && (
          <p className="text-sm text-gray-500 mt-2">Đang tải ảnh lên...</p>
        )}
      </div>


        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
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

export default ProductForm;
