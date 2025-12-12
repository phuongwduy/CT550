import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import CheckoutSteps from "../components/CheckoutSteps";
import { Trash2 } from "lucide-react";

function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  // ✅ Hàm lấy ID đúng cho mọi trường hợp
  const getItemId = (item) => item.item_id || item.product_id || item.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <CheckoutSteps currentStep={1} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm */}
        <div className="md:col-span-2 space-y-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={getItemId(item) || index}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.image || item.product_image}
                  alt={item.name || item.product_name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">
                    {item.name || item.product_name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Đơn giá: {parseFloat(item.price).toLocaleString()}₫
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm">Số lượng:</label>
                    <input
                      type="number"
                      min={1}
                      max={item.stock} 
                      value={item.quantity}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const maxQty = item.stock;
                        if (value > maxQty) {
                          window.toast(`Số lượng vượt quá tồn kho (${maxQty})`, "error");
                          updateQuantity(getItemId(item), maxQty);
                        } else {
                          updateQuantity(getItemId(item), value);
                        }
                      }}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-green-700 font-medium">
                    {(parseFloat(item.price) * item.quantity).toLocaleString()}₫
                  </div>
                  <button
                    onClick={() => removeFromCart(getItemId(item))}
                    className="text-gray-400 hover:text-red-600"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-5 h-fit">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
            🧾 Tóm tắt đơn hàng
          </h2>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Tạm tính:</span>
            <span>{total.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between text-base font-bold text-red-600">
            <span>Tổng cộng:</span>
            <span>{total.toLocaleString()}₫</span>
          </div>
          {cartItems.length > 0 && isLoggedIn ? (
            <Link
              to="/checkout"
              className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-3 rounded-lg text-sm transition"
            >
              HOÀN TẤT ĐẶT HÀNG
            </Link>
          ) : (
            <button
              disabled
              className="block w-full text-center bg-gray-300 text-gray-500 font-medium px-6 py-3 rounded-lg text-sm cursor-not-allowed"
            >
              {cartItems.length === 0
                ? "Giỏ hàng trống — không thể đặt hàng"
                : "Vui lòng đăng nhập để đặt hàng"}
            </button>
          )}
        </div>
      </div>

      {/* Hành động */}
      <div className="mt-10 flex flex-col md:flex-row justify-end gap-4">
        <Link
          to="/products"
          className="px-6 py-3  bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm text-center"
        >
          TIẾP TỤC XEM SẢN PHẨM
        </Link>
      </div>
    </div>
  );
}

export default CartPage;
