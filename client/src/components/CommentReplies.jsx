import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import axios from "axios";

function CommentReplies() {
  const { id } = useParams(); // review_id
  const [replies, setReplies] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const res = await axios.get("/api/reviews/review-replies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter((r) => r.review_id === Number(id));
        setReplies(filtered);
      } catch (err) {
        console.error(err);
        window.toast("Lỗi tải phản hồi", "error");
      }
    };
    fetchReplies();
  }, [id, token]);

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Xóa phản hồi này?")) return;
    try {
      await axios.delete(`/api/reviews/review-replies/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
      window.toast("Đã xóa phản hồi", "info");
    } catch (err) {
      console.error(err);
      window.toast("Lỗi khi xóa phản hồi", "error");
    }
  };

  const filteredReplies = replies
    .filter((r) =>
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.reply_text?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );

  return (
    <div className="p-4">
      <button
        onClick={() => window.history.back()}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Quay lại danh sách bình luận
      </button>


      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc nội dung..."
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/2"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>
      </div>

      {filteredReplies.length === 0 ? (
        <p className="text-gray-500 italic">Không có phản hồi nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReplies.map((r) => (
            <div
              key={r.id}
              className="relative bg-white p-4 rounded-lg shadow-sm flex flex-col gap-2 h-full"
            >
              {/* Nút xóa ở góc trên bên phải */}
              <button
                onClick={() => handleDeleteReply(r.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Xóa phản hồi"
              >
                <Trash2 size={16} />
              </button>

              {/* Header: Avatar + tên */}
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={r.user_avatar || "/default-avatar.png"}
                  alt={r.user_name || "Người dùng"}
                  className="w-8 h-8 rounded-full object-cover border border-green-300"
                />
                <p className="font-medium text-green-700 text-sm">
                  {r.user_name || "Ẩn danh"}
                </p>
              </div>

              {/* Nội dung */}
              <p className="text-sm text-gray-700">{r.reply_text}</p>

              {/* Ngày tạo */}
              <p className="text-xs text-gray-400 mt-auto text-right">
                {new Date(r.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentReplies;
