import { Heart } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  // const token = localStorage.getItem("token");

  const handleAddToCart = (e) => {
    e.preventDefault();

    // Kiểm tra tồn kho
    if (product.stock !== undefined && product.stock <= 0) {
      window.toast("Sản phẩm này đã hết hàng!", "error");
      return;
    }

    //  Kiểm tra giá
    if (!product.price || product.price <= 0) {
      window.toast("Giá sản phẩm không hợp lệ!", "error");
      return;
    }
    const productToAdd = { ...product, quantity: 1 };
    addToCart(productToAdd);
  };


  return (
    <Link
      to={`/products/${product.id}`}
      className="block bg-white rounded-2xl shadow-md overflow-hidden transform transition hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="relative">
        <img
          src={product.image || "/images/no-image.png"}
          alt={product.name}
          className="w-full h-56 object-cover bg-gray-100"
        />

        {/* Nút yêu thích
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
          title="Thêm vào yêu thích"
        >
          <Heart className="text-pink-500" size={20} />
        </button> */}

        {/* Nhãn hết hàng */}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            Hết hàng
          </span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-5 text-center">
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h2>
        <p className="text-amber-600 font-bold mt-1 text-lg">
          {Number(product.price).toLocaleString("vi-VN")}₫
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Đã bán: {product.sold_count?.toLocaleString("vi-VN") || 0}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`mt-3 inline-block px-4 py-2 rounded-lg text-sm transition font-medium ${
            product.stock === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800 text-white"
          }`}
        >
          {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;
