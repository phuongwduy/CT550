import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import axios from "axios";

export default function InventoryTicketForm({ onSuccess }) {
  const [form, setForm] = useState({
    type: "import",
    supplier_id: "",
    note: "",
    items: [{ product_id: "", quantity: 1, import_price: 0 }]
  });

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    axios.get("/api/suppliers").then(res => setSuppliers(res.data));
  }, []);

  useEffect(() => {
    if (form.type === "import" && form.supplier_id) {
      axios
        .get(`/api/products?supplier_id=${form.supplier_id}`)
        .then(res => setProducts(res.data))
        .catch(err => {
          console.error("Lỗi lấy sản phẩm theo nhà cung cấp:", err);
          setProducts([]);
        });
    } else if (form.type === "export") {
      axios
        .get(`/api/products`)
        .then(res => setProducts(res.data))
        .catch(err => {
          console.error("Lỗi lấy sản phẩm:", err);
          setProducts([]);
        });
    } else {
      setProducts([]);
    }
  }, [form.supplier_id, form.type]);


 const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] =
      field === "product_id" || field === "quantity" || field === "import_price"
        ? Number(value)
        : value;
    setForm({ ...form, items: updated });
  };


  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: "", quantity: 1, import_price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated });
  };

  const submit = async () => {
    const isValid = form.items.every(item =>
      item.product_id &&
      item.quantity > 0 &&
      (form.type === "import" ? item.import_price > 0 : true)
    );

    if (form.type === "import" && !form.supplier_id) {
      window.toast("Vui lòng chọn nhà cung cấp.", "error");
      return;
    }

    if (!isValid) {
      window.toast("Vui lòng nhập đầy đủ thông tin sản phẩm.", "error");
      return;
    }
    if (form.type === "export") {
    for (const item of form.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        window.toast(`Không tìm thấy sản phẩm ID ${item.product_id}`, "error");
        return;
      }
      if (item.quantity > product.stock) {
        window.toast(`Sản phẩm "${product.name}" chỉ còn ${product.stock} cái trong kho.`, "error");
        return;
      }
    }
    } 

    const cleanedItems = form.items.map(item => {
      const base = {
        product_id: Number(item.product_id),
        quantity: Number(item.quantity)
      };
      if (form.type === "import") {
        base.import_price = Number(item.import_price);
      }
      return base;
    });

    const payload = {
      type: form.type,
      supplier_id: form.type === "import" ? Number(form.supplier_id) : null,
      note: form.note,
      items: cleanedItems
    };
    const productIds = form.items.map(i => i.product_id);
    const hasDuplicate = new Set(productIds).size !== productIds.length;
    if (hasDuplicate) {
      window.toast("Không được chọn trùng sản phẩm trong cùng một phiếu.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/inventory/tickets", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.toast("Tạo phiếu thành công!", "success");
      onSuccess?.();
      setForm({
        type: "import",
        supplier_id: "",
        note: "",
        items: [{ product_id: "", quantity: 1, import_price: 0 }]
      });

    } catch (err) {
      const message = err.response?.data?.error || "❌ Lỗi tạo phiếu. Vui lòng thử lại.";
      window.toast(message, "error");
      }
  };


  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Loại phiếu</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 w-full"
          >
            <option value="import">Phiếu nhập</option>
            <option value="export">Phiếu xuất</option>
          </select>
        </div>

        {form.type === "import" && (
          <div>
            <label className="block text-sm font-medium mb-1">Nhà cung cấp</label>
            <select
              value={form.supplier_id}
              onChange={e => setForm({ ...form, supplier_id: Number(e.target.value) })}
              className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 w-full"
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <input
            placeholder="Nhập ghi chú..."
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-700">Danh sách sản phẩm</h3>

        {form.items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 items-center">
        {/* Chọn sản phẩm */}
            <div>
              <label className="block text-sm font-medium mb-1">Sản phẩm</label>
              <select
                value={item.product_id}
                onChange={e => handleItemChange(i, "product_id", e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 w-full"
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {form.type === "export" ? `(Còn ${p.stock})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng</label>
              <input
                type="number"
                min={1}
                max={
                  form.type === "export"
                    ? products.find(p => p.id === item.product_id)?.stock || 1
                    : undefined
                }
                placeholder="Số lượng"
                value={item.quantity}
                onChange={e => handleItemChange(i, "quantity", e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 w-full"
              />
            </div>

            {/* Giá nhập (chỉ khi nhập) */}
           {form.type === "import" && (
              <div>
                <label className="block text-sm font-medium mb-1">Giá nhập</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Giá nhập"
                  value={item.import_price.toLocaleString("vi-VN")}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    handleItemChange(i, "import_price", raw);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 w-full"
                />
              </div>
            )}


            {/* Nút xóa */}
            <div className="pt-6">
              <button
                onClick={() => removeItem(i)}
                className="text-red-600 hover:underline text-sm font-medium"
              >
                <Trash2 className="inline-block mr-1" /> Xóa
              </button>
            </div>
          </div>

        ))}
        {form.type === "import" && (
          <div className="text-right text-sm font-semibold text-gray-700 pt-2">
            Tổng tiền:{" "}
            {form.items.reduce((sum, item) => {
              const price = Number(item.import_price || 0);
              const qty = Number(item.quantity || 0);
              return sum + price * qty;
            }, 0).toLocaleString("vi-VN")} ₫
          </div>
        )}

        <button
          onClick={addItem}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={submit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
        >
           <Plus size={18} className="inline-block" /> Tạo phiếu
        </button>
      </div>
    </div>
  );
}
