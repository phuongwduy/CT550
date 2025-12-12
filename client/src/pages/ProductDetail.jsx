import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Star, Minus, Plus, PhoneCall } from "lucide-react";
import { useCart } from "../hooks/useCart";
import ProductReview from "../components/ProductReview";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [reviewStats, setReviewStats] = useState({ total: 0, average: 0 });

  useEffect(() => {
    axios.get(`/api/products/${id}`).then((res) => {
      setProduct(res.data);
      setSelectedSize(res.data.sizes?.[0] || "");
    });
    axios.get(`/api/reviews/review-stats?product_id=${id}`).then((res) => {
      setReviewStats(res.data);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      window.toast("Sản phẩm này đã hết hàng!", "error");
      return;
    }

    if (quantity > product.stock) {
      window.toast(`Chỉ còn ${product.stock} sản phẩm trong kho`, "error");
      return;
    }

    const cartKey = product.id + (selectedSize ? `-${selectedSize}` : "");

    const item = {
      id: product.id,
      cart_key: cartKey,
      name: product.name + (selectedSize ? ` (${selectedSize})` : ""),
      price: product.promo_price || product.price,
      image: product.image,
      quantity,
      size: selectedSize || null,
    };

    addToCart(item);
  };

  if (!product)
    return (
      <div className="text-center py-20 text-gray-500">
        Đang tải thông tin sản phẩm...
      </div>
    );

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 mb-4 text-xs sm:text-sm text-gray-600">
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <a href="/" className="hover:underline text-green-700">Trang chủ</a>
          <span>/</span>
          <a href="/products" className="hover:underline text-green-700">Sản phẩm</a>
          <span>/</span>
          <span className="text-gray-800 font-medium break-all">{product.name}</span>
        </nav>
      </div>

      {/* Chi tiết sản phẩm */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-6">

          {/* GRID: PC = 2 cột – Mobile = 1 cột */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Ảnh sản phẩm */}
            <div className="relative">
              <img
                src={product.image || "/images/no-image.png"}
                alt={product.name}
                className="w-full h-[260px] sm:h-[350px] md:h-[420px] object-cover rounded-xl shadow transition-transform duration-300 hover:scale-105"
              />

              {product.stock <= 0 && (
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs shadow">
                  Hết hàng
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs shadow">
                {product.category_name}
              </div>
            </div>

            {/* THÔNG TIN */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
                {product.name}
              </h1>

              {/* Giá */}
              <div className="mb-4">
                <p className="text-xl sm:text-2xl text-red-600 font-semibold">
                  {product.promo_price
                    ? `${Number(product.promo_price).toLocaleString("vi-VN")}₫`
                    : `${Number(product.price).toLocaleString("vi-VN")}₫`}
                </p>
                {product.promo_price && (
                  <p className="line-through text-gray-500 text-sm">
                    {Number(product.price).toLocaleString("vi-VN")}₫
                  </p>
                )}
              </div>

              {/* Đánh giá */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(reviewStats.average) ? "currentColor" : "none"}
                      stroke="currentColor"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({reviewStats.total} đánh giá)
                </span>
              </div>

              {/* Mô tả */}
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                {product.description || "Không có mô tả"}
              </p>

              {/* Thông tin thêm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-6">
                <div><span className="font-medium">Xuất xứ:</span> {product.province}</div>
                <div><span className="font-medium">Tồn kho:</span> {product.stock} {product.unit_name}</div>
                <div><span className="font-medium">Đơn vị:</span> {product.unit_name}</div>
                <div><span className="font-medium">Danh mục:</span> {product.category_name || "Chưa phân loại"}</div>
              </div>

              {/* Số lượng */}
              <div className="mb-6">
                <label className="block font-medium mb-1">Số lượng:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > product.stock) {
                        window.toast(`Chỉ còn ${product.stock} sản phẩm trong kho`, "error");
                        setQuantity(product.stock);
                      } else {
                        setQuantity(value);
                      }
                    }}
                    className="w-16 text-center px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <button
                    onClick={() =>
                      setQuantity((q) => q >= product.stock ? product.stock : q + 1)
                    }
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Nút hotline + giỏ hàng */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a
                  href="tel:0932223333"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  <PhoneCall size={18} />
                  GỌI HOTLINE
                </a>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 px-6 py-2 rounded-lg text-white transition font-semibold ${
                    product.stock <= 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  {product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </button>
              </div>

            </div>
          </div>

          {/* REVIEW */}
          <ProductReview productId={product.id} />
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
