import React from "react";
import { CreditCard, Wallet, Banknote, Globe } from "lucide-react";

function OrderSummary({
  cartItems,
  total,
  // form,
  // selectedAddressId,
  handleSubmit,
  shippingFee,
  couponCode,
  setCouponCode,
  discountAmount,
  finalTotal,
  handleApplyCoupon,
  setDiscountAmount,
  setFinalTotal,
  paymentMethod,
  setPaymentMethod,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4 h-fit">
      <h2 className="text-xl font-bold text-green-700 mb-4">ĐƠN HÀNG CỦA BẠN</h2>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3">
        {cartItems.map((item, index) => (
          <div key={item.id || index} className="flex justify-between text-sm text-gray-700">
            <span>
              {item.name || item.product_name} × {item.quantity}
            </span>
            <span>{Number(item.price).toLocaleString()}₫</span>
          </div>
        ))}
      </div>

      <hr className="my-2" />

      <div className="flex justify-between text-sm text-gray-600">
        <span>Tạm tính:</span>
        <span>{total.toLocaleString()}₫</span>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Phí vận chuyển:</span>
        <span>{Number(shippingFee).toLocaleString()}₫</span>
      </div>

      {/* Mã giảm giá */}
      <div className="mt-4">
        <label className="block font-medium mb-1 text-sm">Mã giảm giá</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Nhập mã..."
            className="flex-1 border rounded px-3 py-2 text-sm"
            disabled={discountAmount > 0}
          />
          {discountAmount > 0 ? (
            <button
              onClick={() => {
                setCouponCode("");
                setDiscountAmount(0);
                setFinalTotal(total + shippingFee);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Hủy mã
            </button>
          ) : (
            <button
              onClick={handleApplyCoupon}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
            >
              Áp dụng
            </button>
          )}
        </div>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between text-sm text-green-700 font-medium mt-2">
          <span>Giảm giá:</span>
          <span>-{discountAmount.toLocaleString()}₫</span>
        </div>
      )}

      <div className="border-t pt-2 flex justify-between font-bold text-lg text-red-600">
        <span>Tổng cộng:</span>
        <span>{Number(finalTotal).toLocaleString()}₫</span>
      </div>

      {/* ✅ Phương thức thanh toán */}
      <div className="mt-4">
        <label className="block text-sm font-semibold mb-2">Phương thức thanh toán</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="COD">Thanh toán khi nhận hàng (COD)</option>
          <option value="PAYPAL">Thanh toán qua PayPal</option>
        </select>
      </div>


      <button
        onClick={handleSubmit}
        className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg text-sm"
      >
        HOÀN TẤT ĐẶT HÀNG
      </button>
    </div>
  );
}

export default OrderSummary;
