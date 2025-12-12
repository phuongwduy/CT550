function InvoicePrint({ order }) {
  if (!order) return null;


  return (
    <div className="print-invoice text-sm font-sans text-black bg-white border border-gray-300 rounded-md p-6 shadow-md">
      {/* Header */}
    <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-6">
      {/* Logo + thương hiệu */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="MekongFruit" className="h-16" />
        <div>
          <h1 className="text-2xl font-bold text-green-700 uppercase">MekongFruit</h1>
          <p className="text-sm text-gray-600">Chuyên trái cây miền Tây</p>
        </div>
      </div>

      {/* Thông tin hóa đơn */}
      <div className="text-right">
        <h2 className="text-xl font-semibold text-gray-800">HÓA ĐƠN BÁN HÀNG</h2>
        <p className="text-sm text-gray-600">
          Ngày lập: {new Date(order.created_at).toLocaleDateString("vi-VN")}
        </p>
        <p className="text-sm text-gray-600">Mã đơn: {order.order_code}</p>
      </div>
    </div>


      {/* Customer Info */}
      <div className="mb-4 bg-gray-50 p-4 rounded">
        <p><strong>Người nhận:</strong> {order.receiver_name}</p>
        <p><strong>Số điện thoại:</strong> {order.phone}</p>
        <p><strong>Địa chỉ:</strong> {order.address}</p>
        <p><strong>Phương thức thanh toán:</strong> {order.payment_method}</p>
      </div>

      {/* Product Table */}
      <h2 className="font-semibold mt-6 mb-2 text-green-700">Sản phẩm đã mua</h2>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-green-100 text-green-900">
          <tr>
            <th className="text-left py-2 px-2">Sản phẩm</th>
            <th className="text-center py-2 px-2">Số lượng</th>
            <th className="text-right py-2 px-2">Đơn giá</th>
            <th className="text-right py-2 px-2">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-2 px-2">{item.name}</td>
              <td className="text-center py-2 px-2">{item.quantity}</td>
              <td className="text-right py-2 px-2">
                {Number(item.price).toLocaleString()} VNĐ
              </td>
              <td className="text-right py-2 px-2">
                {(item.price * item.quantity).toLocaleString()} VNĐ
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="text-sm">
          <tr>
            <td colSpan="3" className="text-right py-2 px-2 text-gray-700">Phí vận chuyển:</td>
            <td className="text-right py-2 px-2 text-gray-800">
              {Number(order.shipping_fee || 0).toLocaleString()} VNĐ
            </td>
          </tr>
          <tr>
            <td colSpan="3" className="text-right py-2 px-2 text-gray-700">Giảm giá:</td>
            <td className="text-right py-2 px-2 text-red-600">
              - {Number(order.discount_amount || 0).toLocaleString()} VNĐ.
            </td>
          </tr>
          <tr className="bg-gray-100 font-semibold border-t">
            <td colSpan="3" className="text-right py-3 px-2 text-green-800 text-base">Tổng cộng:</td>
            <td className="text-right py-3 px-2 text-green-700 text-xl font-bold">
              {Number(order.total_price).toLocaleString()} VNĐ
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="mt-8 text-sm text-center">
        <p>Người lập hóa đơn: _______________________</p>
        <p className="mt-2">Khách hàng ký nhận: _______________________</p>
        <p className="mt-6 italic text-gray-600">
          Cảm ơn quý khách đã mua hàng tại MekongFruit!<br />
          Hóa đơn không có giá trị khấu trừ thuế.
        </p>
      </div>
    </div>
  );
}

export default InvoicePrint;
