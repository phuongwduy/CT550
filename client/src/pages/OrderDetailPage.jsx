import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Package, Truck, Clock, CheckCircle, XCircle, ArrowLeft, House, CreditCard, ShoppingCart} from "lucide-react";

function OrderDetailPage() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
 

  const statusInfo = {
    pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    packing: { label: "Đang đóng gói", color: "bg-sky-100 text-sky-700", icon: Package },
    shipping: { label: "Đang giao hàng", color: "bg-indigo-100 text-indigo-700", icon: Truck },
    delivered: { label: "Đã giao", color: "bg-green-100 text-green-700", icon: CheckCircle },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700", icon: XCircle },
  };

  useEffect(() => {
    if (!id || !token) return;
    axios
      .get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(() => {
        window.toast("Không thể tải chi tiết đơn hàng.", "error");
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading)
    return <div className="text-center py-20 text-gray-600 animate-pulse">Đang tải...</div>;
  if (!data)
    return (
      <div className="text-center py-20 text-gray-600">
        Không tìm thấy đơn hàng.
        <div className="mt-4">
          <Link to="/my-orders" className="text-green-700 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );

  const { order, items, payment } = data;
  const info = statusInfo[order.status] || {};
  const Icon = info.icon || Package;
  const originalPrice = Number(order.total_price || 0) + Number(order.discount_amount || 0) - Number(order.shipping_fee || 0);
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
          <Package className="w-7 h-7 text-green-600" />
          Đơn hàng #{order.order_code}
        </h1>
        <Link
          to="/my-orders"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </Link>
      </div>

      {/* Trạng thái */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${info.color}`}
      >
        <Icon size={16} />
        <span>{info.label}</span>
      </div>

      {/* Thanh tiến trình trạng thái */}
      <div className="flex items-center justify-between mt-8 mb-10">
        {["pending", "confirmed", "packing", "shipping", "delivered"].map(
          (step, i, arr) => {
            const isActive = arr.indexOf(order.status) >= i;
            const IconStep = statusInfo[step]?.icon || Package;
            return (
              <div key={step} className="flex flex-col items-center text-center flex-1 relative">
                {/* Circle icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isActive
                      ? "bg-green-600 text-white border-green-600 shadow-md"
                      : "bg-gray-100 text-gray-400 border-gray-300"
                  }`}
                >
                  <IconStep size={18} />
                </div>

                {/* Label */}
                <p
                  className={`mt-2 text-xs ${
                    isActive ? "text-green-700 font-semibold" : "text-gray-500"
                  }`}
                >
                  {statusInfo[step]?.label}
                </p>

                {/* Connector line */}
                {i < arr.length - 1 && (
                  <div
                    className={`absolute top-5 right-[-50%] w-full h-[2px] ${
                      isActive ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          }
        )}
      </div>


      {/* Thông tin chi tiết */}
      <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-3 text-green-700">
           <><House className="w-5 h-5 inline-block mr-2 text-green-600" /> Thông tin giao hàng</>
          </h2>
          <p><strong>Người nhận:</strong> {order.receiver_name}</p>
          <p><strong>SĐT:</strong> {order.phone}</p>
          <p><strong>Địa chỉ:</strong> {order.address}</p>
          {/* <p><strong>Ghi chú:</strong> {order.note || "(Không có)"}</p> */}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-3 text-green-700">
            <><CreditCard className="w-5 h-5 inline-block mr-2 text-green-600" /> Thông tin thanh toán</>
          </h2>
          <p>
            <strong>Phương thức:</strong>{" "}
            {payment?.payment_method || "COD"}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {payment?.payment_status === "COMPLETED"
              ? "Đã thanh toán"
              : "Chưa thanh toán"}
          </p>
          {payment?.payment_date && (
            <p>
              <strong>Ngày thanh toán:</strong>{" "}
              {new Date(payment.payment_date).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mt-10">
        <h2 className="font-semibold text-lg mb-4 text-green-700 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Sản phẩm trong đơn hàng
        </h2>

        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <table className="w-full text-sm">
            <thead className="bg-green-50 text-gray-700 uppercase text-xs">
                <tr>
                <th className="text-left p-4">Sản phẩm</th>
                <th className="text-center p-4">Số lượng</th>
                <th className="text-right p-4">Giá</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {items.map((item) => (
                <tr key={item.product_id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                    <div className="flex items-center gap-3">
                        {item.image_public_id && (
                        <img
                            src={`https://res.cloudinary.com/your-cloud-name/image/upload/w_40,h_40,c_fill/${item.image_public_id}.jpg`}
                            alt={item.product_name}
                            className="w-10 h-10 rounded object-cover border"
                        />
                        )}
                        <span className="font-medium text-gray-800">{item.product_name}</span>
                    </div>
                    </td>
                    <td className="text-center p-4">{item.quantity} {item.unit_name || ""} </td>
                  
                    <td className="text-right p-4 text-red-600 font-semibold">
                    {Number(item.price).toLocaleString()}₫ / {item.unit_name || ""}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>


    <div className="mt-8 flex justify-end">
        <div className="bg-gradient-to-r from-green-50 to-white border border-green-300 rounded-xl shadow-md p-5 w-full sm:max-w-md">
            <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
                <span className="font-medium text-gray-600">Tạm tính:</span>
                <span>{originalPrice.toLocaleString()}₫</span>
            </div>
                
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                
                <span className="font-medium text-gray-600">Giảm giá:</span>
                <span>-{Number(order.discount_amount).toLocaleString()}₫</span>
                </div>
            )}
            {order.shipping_fee > 0 && (
                <div className="flex justify-between">
                
                <span className="font-medium text-gray-600">Phí vận chuyển:</span>
                <span>{Number(order.shipping_fee).toLocaleString()}₫</span>
                </div>
            )}

            <div className="border-t pt-3 flex justify-between text-lg font-bold text-red-600">
                <span>Tổng cộng:</span>
                <span>{(Number(order.total_price)).toLocaleString()}₫</span>
            </div>
            </div>
        </div>
    </div>
    </div>
  );
}

export default OrderDetailPage;
