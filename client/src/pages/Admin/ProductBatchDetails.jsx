import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BatchHistoryModal from "../../components/BatchHistoryModal";
export default function InventoryBatchesPage() {
  const { id: productId } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/product/${productId}`
        , { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then((res) => {
        setProduct(res.data.product);
        setBatches(res.data.batches);
      })
      .catch(() => {
        window.toast("Không thể tải dữ liệu lô hàng", "error");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading)
    return <div className="text-center py-20 text-gray-500 animate-pulse">Đang tải dữ liệu...</div>;

  if (!product)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy sản phẩm.
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6">
      {/* Thông tin sản phẩm */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-1">{product.name}</h2>
          {/* <p className="text-gray-600">
            Mã sản phẩm: <span className="font-semibold">{product.id}</span>
          </p> */}
          <p className="text-gray-600">
            Tồn kho hiện tại:{" "}
            <span className="font-semibold text-green-600">{product.stock}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Bảng lô hàng */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">STT</th>
              <th className="p-3 text-left">Mã phiếu kho</th>
              <th className="p-3 text-left">Nhà cung cấp</th>
              <th className="p-3 text-left">Giá nhập</th>
              <th className="p-3 text-left">Số lượng</th>
              <th className="p-3 text-left">Còn lại</th>
              <th className="p-3 text-left">Ngày nhập</th>
              <th className="p-3 text-left">Ghi chú</th>
              <th className="p-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {batches.length > 0 ? (
              batches.map((b, index) => (
                <tr key={b.batch_id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">#{b.ticket_id}</td>
                  <td className="p-3">{b.supplier_name || "—"}</td>
                  <td className="p-3">{Number(b.import_price).toLocaleString()} ₫</td>
                  <td className="p-3">{b.quantity}</td>
                  <td
                    className={`p-3 font-semibold ${
                      b.remaining_quantity > 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {b.remaining_quantity}
                  </td>
                  <td className="p-3">
                    {new Date(b.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3">{b.note || "—"}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedBatchId(b.batch_id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Xem lịch sử
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 p-4 italic">
                  Không có lô hàng nào cho sản phẩm này
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {selectedBatchId && (
          <BatchHistoryModal
            batchId={selectedBatchId}
            onClose={() => setSelectedBatchId(null)}
          />
        )}
      </div>
    </div>
    
  );
}
