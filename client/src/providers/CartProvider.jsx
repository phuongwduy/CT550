import { useState, useEffect, useCallback, useRef, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext"; // ✅ Lấy user từ context

export const CartProvider = ({ children }) => {
  const { user } = useContext(UserContext); // ✅ Không nhận qua props nữa
  const [cartItems, setCartItems] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const isLoggedIn = Boolean(user?.token);
  const localCartBackup = useRef([]);

  // 🟢 Tải giỏ hàng từ server
  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCartItems(res.data.items);
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);
    }
  }, [user?.token]);

  // 🟢 Đồng bộ giỏ hàng local lên server
  const syncLocalCartToServer = useCallback(
    async (items) => {
      try {
        for (const item of items) {
          await axios.post(
            "/api/cart/items",
            { product_id: item.id, quantity: item.quantity },
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        }
        fetchCart();
      } catch (err) {
        console.error("Lỗi đồng bộ giỏ hàng:", err);
      }
    },
    [user?.token, fetchCart]
  );

  // 🟢 Load giỏ hàng ban đầu
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(localCart);
      localCartBackup.current = localCart;
    }
  }, [isLoggedIn, fetchCart]);

  // 🟢 Đồng bộ khi đăng nhập
  useEffect(() => {
    if (isLoggedIn && localCartBackup.current.length > 0) {
      syncLocalCartToServer(localCartBackup.current);
      localStorage.removeItem("cart");
      localCartBackup.current = [];
    }
  }, [isLoggedIn, syncLocalCartToServer]);

  // 🟢 Thêm sản phẩm vào giỏ
  const addToCart = async (product) => {
    const quantityToAdd = product.quantity || 1;

    if (!isLoggedIn) {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.id === product.id ||
            item.product_id === product.id
        );

        let updated;
        if (existing) {
          updated = prev.map((item) =>
            item.id === existing.id || item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          );
        } else {
          updated = [...prev, { ...product, quantity: quantityToAdd }];
        }

        localStorage.setItem("cart", JSON.stringify(updated));
        setShowSidebar(true);
        return updated;
      });
    } else {
      try {
        await axios.post(
          "/api/cart/items",
          { product_id: product.id, quantity: quantityToAdd },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        await fetchCart();
        setShowSidebar(true);
         window.toast("Đã thêm vào giỏ hàng!", "success");
      } catch (err) {
        const msg = err?.response?.data?.message || "Không thể thêm sản phẩm vào giỏ";
        window.toast(msg, "error");
        console.error("Lỗi thêm sản phẩm vào giỏ:", err);
      }

    }

    
  };


  // 🟢 Cập nhật số lượng
  const updateQuantity = async (itemId, newQty) => {
    if (!itemId || isNaN(Number(itemId))) return;

    if (!isLoggedIn) {
      const updated = cartItems.map((item) => {
        const id = item.item_id || item.product_id || item.id;
        return id === itemId
          ? { ...item, quantity: Math.max(1, newQty) }
          : item;
      });
      setCartItems(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
    } else {
      await axios.patch(
        `/api/cart/items/${itemId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchCart();
    }
  };

  // 🟢 Xóa sản phẩm khỏi giỏ
  const removeFromCart = async (itemId) => {
    if (isLoggedIn) {
      try {
        await axios.delete(`/api/cart/items/${itemId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        await fetchCart();
        window.toast("🗑 Đã xóa sản phẩm khỏi giỏ", "info");
      } catch (err) {
        console.error("Lỗi xóa sản phẩm:", err);
        window.toast("❌ Không thể xóa sản phẩm", "error");
      }
    } else {
      const updated = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        showSidebar,
        setShowSidebar,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
