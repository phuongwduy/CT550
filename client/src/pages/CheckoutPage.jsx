import { useState, useEffect } from "react";
import { useCart } from "../hooks/useCart";
import CheckoutSteps from "../components/CheckoutSteps";
import AddressModal from "../components/AddressModal";
import OrderSummary from "../components/OrderSummary";
import ShippingAddressSection from "../components/ShippingAddressSection";
import { useNavigate } from "react-router-dom";

//Tính phí ship
function calculateShippingFee(province_code, total) {
  if (total >= 500000) return 0;
  if (province_code === "ca_mau") return 15000;
  if (["tay_ninh", "vinh_long", "dong_thap", "an_giang", "can_tho"].includes(province_code))
    return 25000;
  return 35000;
}

function CheckoutPage() {
  const { cartItems, fetchCart } = useCart();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    receiver_name: "",
    phone: "",
    province_code: "",
    commune_code: "",
    detail: "",
    note: "",
    is_default: false
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");


  // Tổng tiền hàng
  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const [shippingFee, setShippingFee] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(total + shippingFee);


  // Tính phí ship khi chọn tỉnh
  useEffect(() => {
    if (form.province_code) {
      const fee = calculateShippingFee(form.province_code, total);
      setShippingFee(fee);
    }
  }, [form.province_code, cartItems]);

  useEffect(() => {
    if (discountAmount === 0) {
      setFinalTotal(total + shippingFee);
    }
  }, [total, shippingFee]);

  // Load address từ backend
  useEffect(() => {
    fetch("/api/user/address", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.is_default - a.is_default);
        setSavedAddresses(sorted);

        const defaultAddr = sorted.find((a) => a.is_default);
        if (defaultAddr) {
          handleSelectAddress(defaultAddr.id);
        }
      });
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSelectedAddressId(null);
  };

  // Khi chọn địa chỉ từ danh sách
  const handleSelectAddress = (id) => {
    const addr = savedAddresses.find((a) => a.id === Number(id));
    if (addr) {
      setForm({
        receiver_name: addr.receiver_name,
        phone: addr.phone,
        province_code: addr.province_code,
        commune_code: addr.commune_code,
        detail: addr.detail,
        note: "",
        is_default: addr.is_default
      });

      const fee = calculateShippingFee(addr.province_code, total);
      setShippingFee(fee);

      setSelectedAddressId(id);
    }
  };

  // Lưu hoặc cập nhật địa chỉ
  const handleSaveAddress = async () => {
    const payload = {
      receiver_name: form.receiver_name,
      phone: form.phone,
      province_code: form.province_code,
      commune_code: form.commune_code,
      detail: form.detail,
      is_default: form.is_default,
    };

    let url = "/api/user/address";
    let method = "POST";

    if (editingAddress) {
      url = `/api/user/address/${editingAddress.id}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      window.toast(data.message || "Có lỗi xảy ra khi lưu địa chỉ", "error");
      return;
    }
    if (res.ok) {
      const refreshed = await fetch("/api/user/address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newList = await refreshed.json();
      setSavedAddresses(newList);

      if (!editingAddress) {
        setSelectedAddressId(data.id);
      }

      window.toast("Lưu địa chỉ thành công!", "success");
    }

    setShowAddressModal(false);
    setEditingAddress(null);
  };

  // Xoá địa chỉ
  const handleDeleteAddress = async () => {
    if (!editingAddress) return;

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa địa chỉ này?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/user/address/${editingAddress.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== editingAddress.id));
      setSelectedAddressId(null);
      window.toast("Đã xóa địa chỉ thành công!", "success");
    }
    
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  //  Xử lý đặt hàng
const handleSubmit = async () => {
  let addressId = selectedAddressId;

  // Nếu chưa chọn địa chỉ → bắt lưu mới
  if (!addressId) {
    await handleSaveAddress();
    return window.toast("Vui lòng chọn địa chỉ giao hàng.", "error");
  }

  const payload = {
    address_id: addressId,
    cartItems: cartItems.map((item) => ({
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      price: item.price,
    })),
    note: form.note,
    shipping_fee: shippingFee,
    payment_method: paymentMethod,
    coupon_code: discountAmount > 0 ? couponCode.trim() : null,
    discount_amount: discountAmount > 0 ? discountAmount : 0,
  };

  const res = await fetch("/api/orders/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) return window.toast(data.message, "error");

  await fetchCart();

  // Thanh toán PAYPAL
  if (paymentMethod === "PAYPAL") {
    setIsLoading(true);
    setLoadingMessage("Đang khởi tạo thanh toán PayPal...");
    // Lưu orderId tạm để FE dùng trong trang paypal-success
    localStorage.setItem("paypal_order_id", data.orderId);

    const payRes = await fetch(`/api/payment/paypal/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: data.orderId }),
    });

    const payData = await payRes.json();

    if (!payRes.ok) {
      setIsLoading(false);
      return window.toast("Không thể khởi tạo thanh toán PayPal", "error");
    }

    if (payData.approveUrl) {

      window.toast("Đang chuyển hướng đến PayPal...", "info");
      window.location.href = payData.approveUrl;
      return;
    }
    setIsLoading(false);
    return window.toast("Không tìm thấy liên kết thanh toán PayPal!", "error");
  }
//  

  // Thanh toán COD
  setIsLoading(true);
  setLoadingMessage("Đang xử lý đơn hàng...");
  setTimeout(() => {
  setIsLoading(false);
  window.toast("Đặt hàng thành công!", "success");
  navigate(`/order_success/${data.orderId}`);
}, 1500);
};
const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;

      try {
        const res = await fetch("/api/coupons/apply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: couponCode.trim(),
            total_price: total
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setDiscountAmount(data.discount_amount);
          const rawTotal = total + shippingFee;
          const final = Math.max(rawTotal - data.discount_amount, 0);
          setFinalTotal(final);
          window.toast(`Đã áp dụng mã: giảm ${data.discount_amount.toLocaleString()}₫`, "success");
        } else {
          setDiscountAmount(0);
          setFinalTotal(total + shippingFee);
          window.toast(data.error || "Mã giảm giá không hợp lệ.", "error");
        }
      } catch (err) {
        console.error("Lỗi áp dụng mã:", err);
        window.toast("Không thể áp dụng mã giảm giá.", "error");
      }
    };

  // =================================================================

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <CheckoutSteps currentStep={2} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Thông tin giao hàng */}
        <ShippingAddressSection
          savedAddresses={savedAddresses}
          selectedAddressId={selectedAddressId}
          setSelectedAddressId={setSelectedAddressId}
          form={form}
          setForm={setForm}
          setEditingAddress={setEditingAddress}
          setShowAddressModal={setShowAddressModal}
        />

        {/* Đơn hàng */}
        <OrderSummary
          cartItems={cartItems}
          total={total}
          form={form}
          selectedAddressId={selectedAddressId}
          handleSubmit={handleSubmit}
          shippingFee={shippingFee}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          discountAmount={discountAmount}
          finalTotal={finalTotal}
          handleApplyCoupon={handleApplyCoupon} 
          setDiscountAmount={setDiscountAmount}
          setFinalTotal={setFinalTotal}
          setPaymentMethod={setPaymentMethod}
        />
      </div>

      {/* Modal địa chỉ */}
      {showAddressModal && (
        <AddressModal
          form={form}
          handleChange={handleChange}
          setForm={setForm}
          handleSave={async () => await handleSaveAddress()}
          handleDelete={handleDeleteAddress}
          onClose={() => setShowAddressModal(false)}
        />
      )}


      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
            <p className="text-white mt-4 text-lg font-semibold">
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

    </div>
    

  );
  
}

export default CheckoutPage;
