import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import { useCart } from "../hooks/useCart";
function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const token = localStorage.getItem("token");
  const { fetchCart } = useCart();
  useEffect(() => {
    fetchCart();
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setOrder({
            ...data.order,
            payment_method: data.payment?.payment_method || "Không xác định"
          });
        }
        else {
          console.error("Lỗi khi lấy đơn hàng:", data.message);
        }
      } catch (err) {
        console.error("Lỗi kết nối:", err);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, token]);

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-600">
        Đang tải thông tin đơn hàng...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <CheckoutSteps currentStep={3} />

      <div className="bg-green-50 border border-green-300 rounded-xl p-6 shadow-md text-center mt-6">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          🎉 Đặt hàng thành công!
        </h1>

        <p className="text-gray-700 mb-2">
          Mã đơn hàng của bạn là:{" "}
          <span className="font-semibold text-orange-600">{order.order_code}</span>
        </p>

        <p className="text-gray-600">
          Tổng tiền:{" "}
          <span className="font-semibold text-red-600">
            {Number(order.total_price).toLocaleString()}₫
          </span>
        </p>

        {order.shipping_fee > 0 && (
          <p className="text-gray-600">
            Phí vận chuyển:{" "}
            <span className="font-semibold text-gray-800">
              {Number(order.shipping_fee).toLocaleString()}₫
            </span>
          </p>
        )}

        {order.discount_amount > 0 && (
          <p className="text-gray-600">
            Giảm giá:{" "}
            <span className="font-semibold text-green-600">
              {Number(order.discount_amount).toLocaleString()}₫
            </span>
          </p>
        )}

        {order.coupon_code && (
          <p className="text-gray-600">
            Mã giảm giá:{" "}
            <span className="font-semibold text-blue-600">{order.coupon_code}</span>
          </p>
        )}

        <p className="text-gray-600">
          Phương thức thanh toán:{" "}
          <span className="font-medium">
            {order.payment_method === "COD"
              ? "Trả tiền mặt khi nhận hàng"
              : order.payment_method === "BANK"
              ? "Chuyển khoản"
              : order.payment_method === "VNPAY"
              ? "Thanh toán qua VNPAY"
              : order.payment_method}
          </span>
        </p>


        <div className="mt-6 space-x-4">
          <Link
            to="/my-orders"
            className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 text-sm"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link
            to="/"
            className="inline-block bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 text-sm"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
