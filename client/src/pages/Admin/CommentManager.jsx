import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Trash2, Eye, EyeClosed, Star } from "lucide-react";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";

function CommentManager() {
  const [comments, setComments] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [replies, setReplies] = useState([]);

  const itemsPerPage = 6;
  const token = localStorage.getItem("token");

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get("/api/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error(err);
      window.toast("Lỗi tải bình luận", "error");
    }
  }, [token]);

  const fetchReplies = useCallback(async () => {
    try {
      const res = await axios.get("/api/reviews/review-replies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplies(res.data);
    } catch (err) {
      console.error(err);
      window.toast("Lỗi tải phản hồi", "error");
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      window.toast("Lỗi tải sản phẩm", "error");
    }
  }, [token]);

  useEffect(() => {
    fetchComments();
    fetchProducts();
    fetchReplies();
  }, [fetchComments, fetchProducts, fetchReplies]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await axios.delete(`/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.toast("Đã xóa bình luận", "info");
      fetchComments();
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi xóa", "error");
    }
  };

  const handleToggleHidden = async (id, currentHidden) => {
    try {
      await axios.patch(
        `/api/reviews/${id}`,
        { is_hidden: !currentHidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.toast("Đã cập nhật trạng thái", "success");
      fetchComments();
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const filtered = comments.filter((c) => {
    const matchSearch =
      c.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.comment?.toLowerCase().includes(search.toLowerCase()) ||
      c.product_name?.toLowerCase().includes(search.toLowerCase());

    const matchProduct =
      !selectedProductId || String(c.product_id) === selectedProductId;

    const matchStatus =
      filterStatus === ""
        ? true
        : filterStatus === "visible"
        ? !c.is_hidden
        : c.is_hidden;

    return matchSearch && matchProduct && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tên, sản phẩm hoặc nội dung..."
        />

        <select
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-300"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-300"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="visible">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      {/* Danh sách bình luận */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-green-700 text-white font-semibold">
            <tr>
              <th className="p-3 text-left">Người dùng</th>
              <th className="p-3 text-left">Sản phẩm</th>
              <th className="p-3 text-left">Nội dung</th>
              <th className="p-3 text-left">Đánh giá</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Phản hồi</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {paginated.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                {/* User */}
                <td className="p-3 font-semibold text-green-700">
                  {c.user_name || "Ẩn danh"}
                </td>

                {/* Product */}
                <td className="p-3">{c.product_name || "Không rõ"}</td>

                {/* Content */}
                <td className="p-3">{c.comment}</td>

                {/* Rating */}
                <td className="p-3">
                  <div className="flex items-center gap-1 text-yellow-500 font-medium">
                    <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    {c.rating}/5
                  </div>
                </td>


                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold border
                      ${
                        c.is_hidden
                          ? "bg-gray-100 text-gray-600 border-gray-300"
                          : "bg-green-100 text-green-700 border-green-300"
                      }
                    `}
                  >
                    {c.is_hidden ? "Đã ẩn" : "Đang hiển thị"}
                  </span>
                </td>

                {/* Reply count */}
                <td className="p-3">
                  <button
                    onClick={() => (window.location.href = `/admin/comments/${c.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Xem ({replies.filter((r) => r.review_id === c.id).length})
                  </button>
                </td>

                {/* Actions */}
                <td className="p-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleToggleHidden(c.id, c.is_hidden)}
                    className={`p-1 rounded hover:bg-gray-100 ${
                      c.is_hidden ? "text-gray-600" : "text-green-600"
                    }`}
                    title={c.is_hidden ? "Hiện bình luận" : "Ẩn bình luận"}
                  >
                    {c.is_hidden ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Xóa bình luận"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default CommentManager;
