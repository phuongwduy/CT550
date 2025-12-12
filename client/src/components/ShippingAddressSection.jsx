import React, { useEffect } from "react";

function ShippingAddressSection({
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  
  setForm,
  setEditingAddress,
  setShowAddressModal,
}) {

  // 🟢 Khi chọn một địa chỉ
  const handleSelectAddress = (id) => {
    const addr = savedAddresses.find((a) => a.id === Number(id));
    if (addr) {
      setForm({
        receiver_name: addr.receiver_name,
        phone: addr.phone,
        province_code: addr.province_code,
        commune_code: addr.commune_code,
        detail: addr.detail,
        note: "",
        is_default: addr.is_default,
      });

      setSelectedAddressId(id);
    }
  };

  // 🟢 Tự động chọn địa chỉ mặc định lúc đầu
  useEffect(() => {
    const defaultAddr = savedAddresses.find((a) => a.is_default === 1);
    if (defaultAddr) handleSelectAddress(defaultAddr.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-700">THÔNG TIN GIAO HÀNG</h2>

        {/* Nút thêm địa chỉ */}
        <button
          onClick={() => {
            setForm({
              receiver_name: "",
              phone: "",
              province_code: "",
              commune_code: "",
              detail: "",
              note: "",
              is_default: false,
            });
            setEditingAddress(null);
            setShowAddressModal(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"
        >
          <span>Thêm địa chỉ mới</span>
        </button>
      </div>

      {/* Danh sách địa chỉ đã lưu */}
      {savedAddresses.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Chọn địa chỉ đã lưu:</p>

          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => handleSelectAddress(addr.id)}
                className={`relative border rounded-lg p-4 pl-10 cursor-pointer flex items-start gap-3 transition ${
                  selectedAddressId === addr.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                {/* Radio chọn */}
                <div
                  className={`absolute left-4 top-5 w-4 h-4 rounded-full border-2 ${
                    selectedAddressId === addr.id
                      ? "border-green-600 bg-green-600"
                      : "border-gray-400"
                  }`}
                ></div>

                {/* Nút sửa */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm({
                      id: addr.id,
                      receiver_name: addr.receiver_name,
                      phone: addr.phone,
                      province_code: addr.province_code,
                      commune_code: addr.commune_code,
                      detail: addr.detail,
                      is_default: addr.is_default,
                    });
                    setEditingAddress(addr);
                    setShowAddressModal(true);
                  }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 transition"
                  title="Sửa địa chỉ"
                >
                  Sửa
                </button>

                {/* Nội dung địa chỉ */}
                <div>
                  <p className="font-semibold">{addr.receiver_name} | {addr.phone}</p>

                  {/* DETAIL */}
                  <p className="text-gray-700">{addr.detail}</p>

                  {/* Xã → Tỉnh */}
                  <p className="text-gray-600 text-sm">
                    {addr.commune_name}, {addr.province_name}
                  </p>

                  {/* Tag mặc định */}
                  {addr.is_default === 1 && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <svg
                        className="w-3.5 h-3.5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mặc định
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShippingAddressSection;
