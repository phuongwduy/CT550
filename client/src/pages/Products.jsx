import { useEffect, useState } from "react";
import axios from "axios";
import {
  Filter,
  X,
  Search,
  Mic,
  Camera
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import FilterPanel from "../components/FilterPanel";
import Pagination from "../components/Pagination";
import ImageSearch from "../components/ImageSearch";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [priceFilter, setPriceFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageMode, setImageMode] = useState(false);


  // Bộ lọc tạm trong popup
  const [tempCategoryId, setTempCategoryId] = useState(null);
  const [tempPriceFilter, setTempPriceFilter] = useState("");
  const [tempProvinceFilter, setTempProvinceFilter] = useState("");

  //  STATE PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const provinceList = [
    "Cà Mau",
    "Cần Thơ",
    "Vĩnh Long",
    "Tây Ninh",
    "An Giang",
    "Đồng Tháp",
  ];

  // Lấy danh mục
  useEffect(() => {
    axios
      .get("api/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  // Lấy sản phẩm theo bộ lọc
  useEffect(() => {
  if (imageMode) return;

  let url = "/api/products";
  const params = [];

  if (selectedCategoryId) params.push(`category_id=${selectedCategoryId}`);
  if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
  if (provinceFilter) params.push(`province=${encodeURIComponent(provinceFilter)}`);

  if (priceFilter === "low") params.push("price_max=100000");
  if (priceFilter === "mid") {
    params.push("price_min=100000");
    params.push("price_max=200000");
  }
  if (priceFilter === "high") params.push("price_min=200000");

  if (params.length > 0) url += "?" + params.join("&");

  axios.get(url)
    .then((res) => {
      setProducts(res.data);
      setCurrentPage(1);
    })
    .catch((err) => console.error("Lỗi lấy sản phẩm:", err));
}, [selectedCategoryId, searchTerm, priceFilter, provinceFilter, imageMode]);


  // PHÂN TRANG
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const startVoiceSearch = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "vi-VN"; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);   
      setCurrentPage(1);           
    };

    recognition.onerror = (event) => {
      console.error("Voice search error:", event.error);
    };
  };

  return (
    <div className="min-h-screen from-green-50 to-white pb-12">
      {/* Tiêu đề */}
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-green-700 mb-2">Sản phẩm</h1>
        <p className="text-gray-600">Khám phá đặc sản tươi ngon từ miền Tây</p>
      </div>

      {/* Tìm kiếm + Nút lọc + Nút ảnh */}
      <div className="max-w-6xl mx-auto px-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Ô search + nút ảnh */}
        <div className="flex w-full md:w-2/3 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-green-600" size={18} />

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setImageMode(false);
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-20 py-2 border border-green-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Nút voice */}
            <button
              type="button"
              onClick={startVoiceSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full
                        bg-green-600 text-white hover:bg-green-700 transition"
              aria-label="Tìm kiếm bằng giọng nói"
              title="Tìm kiếm bằng giọng nói"
            >
              <Mic size={18} />
            </button>
          </div>

          {/* Nút tìm kiếm bằng hình ảnh */}
          <button
            type="button"
            onClick={() => setShowImageSearch(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1"
          >
            <Camera size={18} />
          </button>
        </div>

        {/* Nút lọc */}
        <button
          onClick={() => {
            setTempCategoryId(selectedCategoryId);
            setTempPriceFilter(priceFilter);
            setTempProvinceFilter(provinceFilter);
            setShowFilterPanel(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Filter size={18} />
          Bộ lọc
        </button>
      </div>


      {/* Hiển thị bộ lọc đang áp dụng */}
      {(selectedCategoryId || priceFilter || searchTerm || provinceFilter) && (
        <div className="max-w-6xl mx-auto px-4 mb-4 text-sm text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-medium text-green-700">Đang lọc theo:</span>

            {selectedCategoryId && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Danh mục: {categories.find((cat) => cat.id === selectedCategoryId)?.name}
              </span>
            )}
            {priceFilter === "low" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Giá dưới 100.000₫
              </span>
            )}
            {priceFilter === "mid" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Giá 100.000₫ – 200.000₫
              </span>
            )}
            {priceFilter === "high" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Giá trên 200.000₫
              </span>
            )}
            {provinceFilter && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Tỉnh: {provinceFilter}
              </span>
            )}
            {searchTerm && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Từ khóa: “{searchTerm}”
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setPriceFilter("");
              setSearchTerm("");
              setProvinceFilter("");
              setCurrentPage(1);
              setImageMode(false);
            }}
            className="text-red-600 hover:underline text-sm"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
      {/* Popup tìm kiếm bằng hình ảnh */}
      {showImageSearch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-[95%] sm:w-full sm:max-w-lg relative">
            <button
              onClick={() => setShowImageSearch(false)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <ImageSearch
              onSearch={(list) => {
                setImageMode(true);
                setProducts(list);
                setShowImageSearch(false);
                setCurrentPage(1);
                setSearchTerm("");
              }}
            />
          </div>
        </div>
      )}

      {/* Popup bộ lọc */}
      {showFilterPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex sm:justify-end justify-center">
          <FilterPanel
            categories={categories}
            provinceList={provinceList}
            tempCategoryId={tempCategoryId}
            setTempCategoryId={setTempCategoryId}
            tempPriceFilter={tempPriceFilter}
            setTempPriceFilter={setTempPriceFilter}
            tempProvinceFilter={tempProvinceFilter}
            setTempProvinceFilter={setTempProvinceFilter}
            onApply={() => {
              setSelectedCategoryId(tempCategoryId);
              setPriceFilter(tempPriceFilter);
              setProvinceFilter(tempProvinceFilter);
              setShowFilterPanel(false);
              setCurrentPage(1);
            }}
            onClose={() => setShowFilterPanel(false)}
          />
        </div>
      )}


      {/*Danh sách sản phẩm */}
      <section
        id="products"
        className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
      >
        {currentProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            <p className="text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        ) : (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </section>
       

      {/* ⭐ PHÂN TRANG */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}

export default Products;
