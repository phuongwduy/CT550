import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Printer, Box, ShoppingCart } from "lucide-react";
import InvoicePrint from "../../components/InvoicePrint";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
    
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
        console.log("Chi tiết đơn hàng:", res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết đơn hàng:", err);
        window.toast("Không tìm thấy đơn hàng", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, token]);

  if (loading)
    return <p className="p-6 text-gray-500">Đang tải chi tiết đơn hàng...</p>;
  if (!order)
    return <p className="p-6 text-red-600 font-medium">Không tìm thấy đơn hàng.</p>;

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    packing: "bg-purple-100 text-purple-800 border-purple-300",
    shipping: "bg-indigo-100 text-indigo-800 border-indigo-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    returned: "bg-gray-100 text-gray-800 border-gray-300",
  };
    const paymentStatusLabel = {
      PENDING: "Chưa xác nhận",
      COMPLETED: "Đã xác nhận", 
  };
  const paymentStatusColor = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    COMPLETED: "bg-green-100 text-green-800 border-green-300",
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header điều hướng */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        {order.payment_method === "BANK" &&
            order.payment_status === "PENDING" && (
              <button
                onClick={async () => {
                  try {
                    await axios.post(
                      "/api/payment/admin/confirm-transfer",
                      { order_id: order.id },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    window.toast("✔ Đã xác nhận thanh toán!", "success");

                    // Reload lại
                    const res = await axios.get(`/api/admin/orders/${id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setOrder(res.data);

                  } catch{
                    window.toast("Lỗi khi xác nhận thanh toán!", "error");
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium shadow-sm"
              >
                Xác nhận đã nhận chuyển khoản
              </button>
            )}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium shadow-sm transition"
        >
          <Printer size={16} /> In đơn hàng
        </button>

      </div>

      {/* Thông tin đơn hàng */}
      <div className="bg-white p-6 rounded-xl shadow-md no-print">
        <h1 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
         <Box size={26}/> Chi tiết đơn hàng
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
          <div className="space-y-2 text-sm">
            <p><strong>Mã đơn:</strong> <span className="font-mono text-gray-700">{order.order_code}</span></p>
            <p><strong>Người nhận:</strong> {order.receiver_name || "Không có"}</p>
            <p><strong>SĐT:</strong> {order.phone || "Không có"}</p>
            <p><strong>Địa chỉ:</strong> {order.address || "Không có"}</p>
            <p><strong>Phương thức thanh toán:</strong> {order.payment_method || "Không rõ"}</p>

          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Ghi chú:</strong> {order.note || "Không có"}</p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span className={`px-2 py-1 rounded-md border text-xs font-semibold ${statusColor[order.status]}`}>
                {order.status}
              </span>
            </p>
            <p><strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleString()}</p>
            {order.updated_at && (
              <p><strong>Cập nhật:</strong> {new Date(order.updated_at).toLocaleString()}</p>
            )}
            {order.payment_method === "BANK" && (
                <p>
                  <strong>Trạng thái thanh toán:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-md border text-xs font-semibold ${
                      paymentStatusColor[order.payment_status] || "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  >
                    {paymentStatusLabel[order.payment_status] || "Không rõ"}
                  </span>
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden no-print">
        <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b flex items-center gap-2">
          <ShoppingCart size={20}/> Sản phẩm trong đơn hàng
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
              <tr>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-center">Số lượng</th>
                <th className="px-4 py-2 text-right">Đơn giá</th>
                <th className="px-4 py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2 flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-md border"
                      />
                    )}
                    <span>{item.name}</span>
                  </td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{Number(item.price).toLocaleString()}₫</td>
                  <td className="px-4 py-2 text-right font-medium">
                    
                    {(item.price * item.quantity).toLocaleString()}₫
                  </td>
                </tr>
              ))}
            </tbody>
           <tfoot className="bg-gray-50 font-semibold text-sm">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right text-gray-700">Phí vận chuyển:</td>
                <td colSpan={2} className="px-4 py-2 text-right text-gray-800">
                  {Number(order.shipping_fee).toLocaleString()}₫
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right text-gray-700">Giảm giá:</td>
                <td colSpan={2} className="px-4 py-2 text-right text-red-600">
                  -{Number(order.discount_amount || 0).toLocaleString()}₫
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-green-800 text-base border-t">
                  Tổng cộng:
                </td>
                <td colSpan={2} className="px-4 py-3 text-right text-green-700 text-xl font-bold border-t">
                  {Number(order.total_price).toLocaleString()}₫
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

      {/* Phiên bản in */}
      <div className="hidden print:block">
        <InvoicePrint order={order} />
      </div>
    </div>
  );
}

export default OrderDetail;
