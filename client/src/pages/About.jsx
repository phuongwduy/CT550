import React from "react";
import { Mail, Leaf, Truck, ShieldCheck, Handshake } from "lucide-react";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">

      {/* Banner Miền Tây */}
      <section className="relative h-72 sm:h-[420px]">
        <img
          src="/images/mekong-banner.jpg"   
          alt="Giới thiệu MekongFruit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg tracking-wide">
            Về MekongFruit
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-green-100 max-w-2xl">
            Mang đặc sản sông nước miền Tây đến gần hơn với mọi nhà
          </p>
        </div>
      </section>

      {/* Sứ mệnh */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-green-700 mb-6">
          🌿 Sứ mệnh của chúng tôi
        </h2>
        <p className="text-gray-700 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
          MekongFruit hướng đến việc mang trái cây tươi – sạch – đúng chuẩn miền Tây
          đến khắp mọi miền đất nước, đồng thời góp phần nâng cao thu nhập và xây dựng
          chuỗi cung ứng bền vững cho bà con nông dân.
        </p>
      </section>

      {/* Giá trị cốt lõi */}
      <section className=" from-green-50 to-green-100 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-10">
            Giá trị cốt lõi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Leaf size={40} className="text-green-600" />,
                title: "Tươi ngon",
                desc: "Trái cây thu hoạch trong ngày, giữ trọn hương vị thiên nhiên."
              },
              {
                icon: <Handshake size={40} className="text-green-600" />,
                title: "Kết nối nhà vườn",
                desc: "Làm việc trực tiếp với nông dân miền Tây, minh bạch nguồn gốc."
              },
              {
                icon: <ShieldCheck size={40} className="text-green-600" />,
                title: "An toàn",
                desc: "Sản phẩm đạt chuẩn VietGAP – không hóa chất độc hại."
              },
              {
                icon: <Truck size={40} className="text-green-600" />,
                title: "Giao nhanh",
                desc: "Đóng gói cẩn thận – giao tận nơi trong ngày."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="mb-4 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold text-xl text-green-700">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hình miền Tây thật */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-8 text-center">
          Hành trình từ vườn đến bàn ăn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { img: "mekong-vuon.jpg", title: "Vườn trái cây", desc: "Nguồn trái cây phong phú của miền sông nước." },
            { img: "mekong-thu-hoach.jpg", title: "Thu hoạch", desc: "Trái cây chín tự nhiên – hái đúng độ ngon." },
            {img: "mekong-giao-hang.png", title: "Giao hàng", desc: "Đóng gói cẩn thận và giao đến tay khách hàng trong ngày."}
          ].map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:scale-105 bg-white"
            >
              <img
                src={`/images/${step.img}`}
                alt={step.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-green-700 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video giới thiệu miền Tây */}
      <section className="bg-green-50 py-16 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6">
            Video giới thiệu miền Tây
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Trải nghiệm vẻ đẹp của sông nước, vườn trái cây, và văn hoá đặc sắc miền Tây Nam Bộ.
        </p>

        <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg">
            <iframe
            width="100%"
            height="360"
            src="https://www.youtube.com/embed/37dfJPo45Jk?autoplay=1&mute=1"
            title="Giới thiệu miền Tây"
            className="rounded-xl"
            allow="autoplay; encrypted-media"
            allowFullScreen
            ></iframe>

        </div>
        </section>



    </div>
  );
}

export default About;
