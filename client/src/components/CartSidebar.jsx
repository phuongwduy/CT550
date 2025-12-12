import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

function CartSidebar() {
  const { cartItems, showSidebar, setShowSidebar, removeFromCart } = useCart();
  const getItemId = (item) => item.item_id || item.product_id || item.id;
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const [defaultAddress, setDefaultAddress] = useState(null);

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  // Khóa cuộn khi mở sidebar
  useEffect(() => {
    document.body.style.overflow = showSidebar ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showSidebar]);

  // Lấy địa chỉ mặc định nếu đã đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      setDefaultAddress(null);
      return;
    }

    fetch("/api/user/address", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const defaultAddr = data.find((a) => a.is_default === 1);
        if (defaultAddr) {
          setDefaultAddress(defaultAddr);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy địa chỉ mặc định:", err);
      });
  }, [isLoggedIn]);

  return (
    <>
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-[998]"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-white shadow-lg z-[999] transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4 h-full flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-green-700">🛒 GIỎ HÀNG</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p>
            ) : (
              cartItems.map((item, index) => (
                <div
                  key={getItemId(item) || index}
                  className="flex items-center justify-between gap-3 border-b pb-3"
                >
                  <img
                    src={item.product_image || item.image}
                    alt={item.product_name || item.name}
                    className="w-14 h-14 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.product_name || item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-sm text-green-700 font-semibold">
                      {(parseFloat(item.price) * item.quantity).toLocaleString()}₫
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(getItemId(item))}
                    className="text-gray-400 hover:text-red-600"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <hr className="my-2" />
          <div className="flex justify-between font-bold text-red-600 text-lg">
            <span>Tổng cộng:</span>
            <span>{total.toLocaleString()}₫</span>
          </div>

          {/* ✅ Địa chỉ mặc định nếu có */}
          {defaultAddress && (
            <div className="mt-2 text-sm text-gray-700">
              <p className="font-medium text-green-700">📍 Giao đến:</p>
              <p>{defaultAddress.receiver_name} | {defaultAddress.phone}</p>
              <p>{defaultAddress.detail}, {defaultAddress.commune_name}, {defaultAddress.province_name}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Link
              to="/cart"
              className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm"
              onClick={() => setShowSidebar(false)}
            >
              XEM GIỎ HÀNG
            </Link>
            {isLoggedIn ? (
              <Link
                to="/checkout"
                className="w-full text-center bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm"
                onClick={() => setShowSidebar(false)}
              >
                ĐẶT HÀNG
              </Link>
            ) : (
              <button
                disabled
                className="w-full text-center bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                title="Bạn cần đăng nhập để đặt hàng"
              >
                Vui lòng đăng nhập để đặt hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CartSidebar;
