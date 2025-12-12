import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../hooks/useCart";
export default function PaypalSuccess() {
  const [params] = useSearchParams();
  const { fetchCart } = useCart();
  const navigate = useNavigate();
    
  const token = params.get("token");      // = paypalOrderId
  const payerId = params.get("PayerID");  // PayPal required

  const hasRun = useRef(false); // tránh chạy 2 lần

  useEffect(() => {
    // Nếu đã chạy rồi → không chạy lần 2
    if (hasRun.current) return;
    hasRun.current = true;

    if (!token || !payerId) {
      window.toast("Thiếu thông tin thanh toán PayPal!", "error");
      return navigate("/");
    }

    const orderId = localStorage.getItem("paypal_order_id"); // Lưu tạm ở FE

    if (!orderId) {
      window.toast("Không tìm thấy order!", "error");
      return navigate("/");
    }

    const capture = async () => {
      const res = await fetch(`/api/payment/paypal/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId: token, // chính là token từ PayPal
          order_id: orderId
        }),
      });

      await res.json();

      if (res.ok) {
        window.toast("Thanh toán PayPal thành công!", "success");
        localStorage.removeItem("paypal_order_id");
        fetchCart();
        navigate(`/order_success/${orderId}`);
      } else {
        window.toast("Lỗi xác nhận thanh toán PayPal!", "error");
        navigate("/");
      }
    };

    capture();
  }, []);

  return (
    <div className="p-10 text-center text-xl font-bold">
      Đang xác nhận thanh toán PayPal...
    </div>
  );
}
