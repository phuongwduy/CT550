import { X, Tag, DollarSign, Map } from "lucide-react";

function FilterPanel({
  categories,
  provinceList,
  tempCategoryId,
  setTempCategoryId,
  tempPriceFilter,
  setTempPriceFilter,
  tempProvinceFilter,
  setTempProvinceFilter,
  onApply,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
      <div className="w-full sm:w-[400px] bg-white h-full shadow-lg p-4 sm:p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-700">Bộ lọc sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-green-700 hover:text-green-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Danh mục */}
        <div className="mb-6">
          <h3 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
            <Tag size={16} /> Danh mục
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTempCategoryId(null)}
              className={`px-4 py-2 rounded-full border ${
                tempCategoryId === null
                  ? "bg-green-700 text-white"
                  : "bg-white text-green-700 border-green-700"
              } hover:bg-green-600 hover:text-white transition`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setTempCategoryId(cat.id)}
                className={`px-4 py-2 rounded-full border ${
                  tempCategoryId === cat.id
                    ? "bg-green-700 text-white"
                    : "bg-white text-green-700 border-green-700"
                } hover:bg-green-600 hover:text-white transition`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Giá */}
        <div className="mb-6">
          <h3 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
            <DollarSign size={16} /> Giá
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Tất cả", value: "" },
              { label: "Dưới 100.000₫", value: "low" },
              { label: "100.000₫ – 300.000₫", value: "mid" },
              { label: "Trên 300.000₫", value: "high" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTempPriceFilter(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  tempPriceFilter === option.value
                    ? "bg-green-700 text-white"
                    : "bg-white text-green-700 border-green-700"
                } hover:bg-green-600 hover:text-white transition`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tỉnh */}
        <div className="mb-6">
          <h3 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
            <Map size={16} /> Xuất xứ
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTempProvinceFilter("")}
              className={`px-4 py-2 rounded-full border ${
                tempProvinceFilter === ""
                  ? "bg-green-700 text-white"
                  : "bg-white text-green-700 border-green-700"
              } hover:bg-green-600 hover:text-white transition`}
            >
              Tất cả
            </button>
            {provinceList.map((province) => (
              <button
                key={province}
                onClick={() => setTempProvinceFilter(province)}
                className={`px-4 py-2 rounded-full border ${
                  tempProvinceFilter === province
                    ? "bg-green-700 text-white"
                    : "bg-white text-green-700 border-green-700"
                } hover:bg-green-600 hover:text-white transition`}
              >
                {province}
              </button>
            ))}
          </div>
        </div>

        {/* Nút áp dụng + reset */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => {
              setTempCategoryId(null);
              setTempPriceFilter("");
              setTempProvinceFilter("");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <span>Reset bộ lọc</span>
          </button>

          <button
            onClick={onApply}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
