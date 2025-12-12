function Footer() {
  return (
    <footer className="bg-green-800 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thông tin liên hệ */}
        <div>
          <h2 className="text-xl font-bold mb-4">MekongFruit</h2>
          <p className="mb-2">📍 Địa chỉ: Ấp Xóm Lớn, Xã Lý Văn Lâm, TP. Cà Mau, Tỉnh Cà Mau</p>
          <p className="mb-2">📍 Địa chỉ 2: Ấp Tân Hiệp, Xã Tân Thành, TP. Cà Mau, Tỉnh Cà Mau</p>
          <p className="mb-2">📞 Hotline: <a href="tel:0949414932" className="underline">0949 414 932</a></p>
          <p className="mb-2">📧 Email: <a href="mailto:info@MekongFruit.com" className="underline">info@MekongFruit.com</a></p>
          <p className="mb-2">🌐 Website: <a href="https://MekongFruit.com" target="_blank" rel="noopener noreferrer" className="underline">MekongFruit.com</a></p>
        </div>

        {/* Liên kết & bản đồ */}
        <div>
          <h2 className="text-xl font-bold mb-4">Liên kết nhanh</h2>
          <ul className="space-y-2">
            <li><a href="/" className="hover:underline">Trang chủ</a></li>
            <li><a href="/products" className="hover:underline">Sản phẩm</a></li>
            <li><a href="/about" className="hover:underline">Giới thiệu</a></li>
            <li><a href="/#contact" className="hover:underline">Liên hệ</a></li>
          </ul>

          {/* Bản đồ nhúng*/}
          <div className="mt-6">
            <iframe
              title="Bản đồ MekongFruit"
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.272!2d105.152!3d9.176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQ2EgbWF1!5e0!3m2!1svi!2svn!4v1699999999999"
               width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className="rounded-md shadow"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm text-green-200 mt-10">
        © 2025 MekongFruit. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
