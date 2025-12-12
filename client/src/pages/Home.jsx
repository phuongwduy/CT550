import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [topSelling, setTopSelling] = useState([]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/coupons/subscribe", { email });
      window.toast("Đăng ký thành công, vui lòng kiểm tra email!", "success");
      setEmail("");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

useEffect(() => {
  axios
    .get("/api/products")
    .then((res) => setProducts(res.data))
    .catch((err) => console.error("Lỗi lấy sản phẩm bán chạy:", err));
}, []);
useEffect(() => {
  axios
    .get("/api/products/top-selling")
    .then((res) => setTopSelling(res.data))
    .catch((err) => console.error("Lỗi lấy sản phẩm bán chạy:", err));
}, []);



  return (
    <div className="min-h-screen  from-green-50 to-white">

      {/* Banner */}
      <section className="mb-6">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          speed={800}
        >

          {["banner1.png", "banner2.jpg", "banner3.png"].map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={`/images/${img}`}
                alt={`Banner ${index + 1}`}
                className="w-full h-[220px] sm:h-[350px] md:h-[480px] object-cover rounded-b-xl sm:rounded-b-3xl shadow-md"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Giới thiệu */}
      <section className="max-w-5xl mx-auto px-4 py-6 sm:py-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-3 sm:mb-4">
          Miền Tây – Vùng đất trù phú
        </h2>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
          Miền Tây nổi tiếng với sông nước, cây trái quanh năm, và những đặc sản đậm chất quê hương.
          MekongFruit mang đến cho bạn hương vị nguyên bản nhất từ nhà vườn.
        </p>
      </section>

      {/* Vì sao chọn */}
      <section className="bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-6">
            Vì sao chọn MekongFruit?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {[
              { icon: "fresh.png", title: "Tươi ngon mỗi ngày", desc: "Trái cây hái tại vườn, giao trong ngày." },
              { icon: "farmer.png", title: "Hỗ trợ nông dân", desc: "Kết nối trực tiếp với nhà vườn miền Tây." },
              { icon: "organic.png", title: "Sạch & an toàn", desc: "Không hóa chất, đạt chuẩn VietGAP." },
              { icon: "delivery.png", title: "Giao hàng nhanh", desc: "Giao tận nơi trong 3 giờ nội thành." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
              >
                <img
                  src={`/icons/${item.icon}`}
                  alt={item.title}
                  className="mx-auto h-12 sm:h-14 mb-3"
                />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-6">
          Sản phẩm bán chạy
        </h2>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000 }}
          spaceBetween={15}
          slidesPerView={1.2}
          breakpoints={{
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {topSelling.map((product) => (
            <SwiperSlide key={product.id} className="p-1">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Products by Category */}
      {categories.map((cat) => {
        const list = products.filter((p) => p.category_id === cat.id).slice(0, 6);
        if (list.length === 0) return null;

        return (
          <section key={cat.id} className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-4">
              {cat.name}
            </h2>

            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 3500 }}
              spaceBetween={15}
              slidesPerView={1.2}
              breakpoints={{
                480: { slidesPerView: 1.5 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {list.map((product) => (
                <SwiperSlide key={product.id} className="p-1">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        );
      })}

      {/* Blog */}
      <section className="bg-green-50 py-10 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-8 sm:mb-10">
            Mẹo chọn trái cây ngon
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Cách chọn bưởi ngon",
                image: "buoi.jpg",
                desc: "Chọn quả vỏ mỏng, múi đều, cầm nặng tay sẽ ngọt và mọng nước.",
              },
              {
                title: "Chọn sầu riêng Ri6 chuẩn",
                image: "saurieng.jpg",
                desc: "Gai thưa, cuống tươi, gõ nghe 'bộp bộp' là cơm dày – chín đều.",
              },
              {
                title: "Mẹo chọn xoài chín tự nhiên",
                image: "xoai.jpg",
                desc: "Cuống còn nhựa, da vàng đều, thơm nhẹ – không ép chín.",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={`/images/${tip.image}`}
                  alt={tip.title}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-green-800 mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Subscribe */}
      <section id="contact" className="bg-yellow-50 text-green-800 py-10 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            Đăng ký nhận tin khuyến mãi
          </h2>

          <p className="mb-5 sm:mb-6 text-green-600 text-sm sm:text-base">
            Nhận thông tin về sản phẩm mới, ưu đãi đặc biệt và mẹo chọn trái cây ngon.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              className="px-4 py-2 rounded-lg text-gray-800 w-full sm:w-80 border border-green-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold transition shadow-sm ${
                loading
                  ? "bg-green-400 text-white cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Đang gửi..." : "Đăng ký"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;
