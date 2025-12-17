import { useState, useRef } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import axios from "axios";

export default function FruitRecognizer({ onSearch }) {
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const imgRef = useRef();

  const handleImageUpload = (file) => {
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setResults([]);
  };

  const predictImage = async () => {
    if (!file) return;
    setLoading(true);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/search-by-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      
      if (data.results && data.results.length > 0) {
        // lọc sản phẩm similarity >= 0.7
        const filtered = data.results.filter(r => r.similarity >= 0.7);

        if (filtered.length > 0) {
          setResults(filtered);
          if (onSearch) {
            onSearch(filtered);
          }
        } else {
          setResults([{ name: "Không tìm thấy sản phẩm phù hợp", similarity: 0 }]);
        }
      } else {
        setResults([{ name: "Không tìm thấy sản phẩm phù hợp", similarity: 0 }]);
      }
    } catch (err) {
      console.error(err);
      setResults([{ name: "Lỗi kết nối server. Vui lòng thử lại sau.", similarity: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl max-w-lg mx-auto space-y-5 border border-gray-100">
      <h2 className="text-xl font-bold text-emerald-700 text-center">
        Tìm kiếm bằng hình ảnh
      </h2>

      {/* Upload zone */}
      <label className="w-full border-2 border-dashed border-emerald-300 hover:border-emerald-500 transition cursor-pointer rounded-xl p-6 flex flex-col items-center justify-center space-y-3 bg-emerald-50/30">
        <ImageIcon size={32} className="text-emerald-600" />
        <p className="text-sm text-emerald-700 font-medium">Chọn hình ảnh</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
      </label>

      {/* Preview */}
      {preview && (
        <div className="flex justify-center">
          <img
            ref={imgRef}
            src={preview}
            alt="Preview"
            className="w-48 h-48 rounded-xl object-cover shadow-md border border-gray-200"
          />
        </div>
      )}

      {/* Button */}
      <button
        onClick={predictImage}
        disabled={!preview || loading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
          text-white font-semibold shadow-md transition 
          ${!preview || loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          {results.map((r, idx) => (
            <div
              key={idx}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm flex gap-4 items-center"
            >
              {r.image && (
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              )}
              <div>
                <p className="text-emerald-700 font-semibold">
                  {r.name}{" "}
                  {r.similarity
                    ? `(${Math.round(r.similarity * 100)}% giống)`
                    : ""}
                </p>
                {r.price && (
                  <p className="text-sm text-gray-600">Giá: {r.price} đ</p>
                )}
                {r.province && (
                  <p className="text-sm text-gray-500">Xuất xứ: {r.province}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
