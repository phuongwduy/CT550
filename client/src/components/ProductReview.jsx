import { useState, useEffect } from "react";
import axios from "axios";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

function ProductReview({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [replyText, setReplyText] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [openReplies, setOpenReplies] = useState({});
  const [canReview, setCanReview] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchReviews = () => {
    axios.get(`/api/reviews?product_id=${productId}`).then((res) => {
      setReviews(res.data);
    });

    axios.get(`/api/reviews/review-replies?product_id=${productId}`).then((res) => {
      setReplies(res.data);
    });
  };

  // 🔍 Kiểm tra user có được đánh giá hay không
  useEffect(() => {
    if (token) {
      axios
        .get(`/api/reviews/can-review?product_id=${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setCanReview(res.data.can_review))
        .catch(() => setCanReview(false));
    }
  }, [productId, token]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/reviews",
        {
          product_id: productId,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
      window.toast("Đánh giá đã được gửi!", "success");
    } catch (err) {
      window.toast(err.response?.data?.error || "Lỗi khi gửi đánh giá", "error");
    }
  };

  const handleReply = async (reviewId) => {
    const reply = replyText[reviewId];
    if (!reply?.trim()) return;

    try {
      await axios.post(
        "/api/reviews/review-replies",
        { review_id: reviewId, reply_text: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      setActiveReplyBox(null);
      fetchReviews();
      window.toast("Đã gửi phản hồi", "success");
    } catch (err) {
      window.toast(err?.response?.data?.error || "Lỗi khi gửi phản hồi", "error");
    }
  };

  const toggleReplies = (reviewId) => {
    setOpenReplies((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn thu hồi đánh giá này?")) return;
    try {
      await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
      window.toast("Đã thu hồi đánh giá", "info");
    } catch (err) {
      window.toast(err?.response?.data?.error || "Lỗi khi thu hồi đánh giá", "error");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Bạn có chắc muốn thu hồi phản hồi này?")) return;
    try {
      await axios.delete(`/api/reviews/review-replies/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
      window.toast("Đã thu hồi phản hồi", "info");
    } catch {
      window.toast("Lỗi khi thu hồi phản hồi", "error");
    }
  };

  return (
    <div className="mt-10 bg-white rounded-xl p-4 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Đánh giá sản phẩm</h2>
      <p className="text-sm text-gray-500 mb-4">
        Chia sẻ cảm nhận của bạn để giúp người khác mua sắm tốt hơn.
      </p>

      {/* ⭐ Trạng thái form đánh giá */}
      {!token && (
        <p className="text-gray-500 italic mb-6">Bạn cần đăng nhập để gửi đánh giá.</p>
      )}

      {token && !canReview && (
        <p className="text-gray-500 italic mb-6">
          Bạn cần mua sản phẩm này để gửi đánh giá.
        </p>
      )}

      {token && canReview && (
        <form onSubmit={handleSubmitReview} className="mb-6">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewReview((r) => ({ ...r, rating: star }))}
                className={`text-yellow-500 text-xl ${
                  star <= newReview.rating ? "opacity-100" : "opacity-30"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
            rows={3}
            placeholder="Viết cảm nhận của bạn..."
            className="w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
          />

          <div className="text-right mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
            >
              Gửi đánh giá
            </button>
          </div>
        </form>
      )}

      {/* Danh sách đánh giá */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="pb-4">
              <div className="flex items-start gap-3">
                <img
                  src={r.user_avatar || "/default-avatar.png"}
                  alt={r.user_name}
                  className="w-10 h-10 rounded-full object-cover border border-green-300"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">
                      {r.user_name} –{" "}
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </p>

                    {r.user_id === currentUser.id && (
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Thu hồi
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500 mt-1">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                    {r.comment.length > 500 ? r.comment.slice(0, 100) + "..." : r.comment}
                  </p>


                  {replies.some((rep) => rep.review_id === r.id) && (
                    <button
                      onClick={() => toggleReplies(r.id)}
                      className="flex items-center gap-1 text-sm text-green-600 hover:underline mt-2"
                    >
                      {openReplies[r.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {replies.filter((rep) => rep.review_id === r.id).length} phản hồi
                    </button>
                  )}

                  {/* Phản hồi */}
                  <div className="mt-3 space-y-2">
                    {openReplies[r.id] &&
                      replies
                        .filter((rep) => rep.review_id === r.id)
                        .map((rep) => (
                          <div key={rep.id} className="ml-4 pl-3 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <img
                                src={rep.user_avatar || "/default-avatar.png"}
                                alt={rep.user_name}
                                className="w-8 h-8 rounded-full object-cover border border-green-300"
                              />
                              <div>
                                <p className="font-medium text-green-700">
                                  {rep.user_name} –
                                  <span className="text-xs text-gray-400 ml-1">
                                    {new Date(rep.created_at).toLocaleDateString("vi-VN")}
                                  </span>
                                </p>

                                <p className="whitespace-pre-line">
                                  {rep.reply_text.length > 300
                                    ? rep.reply_text.slice(0, 300) + "..."
                                    : rep.reply_text}
                                </p>

                              
                                {rep.user_id === currentUser.id && (
                                  <button
                                    onClick={() => handleDeleteReply(rep.id)}
                                    className="text-xs text-red-500 hover:underline"
                                  >
                                    Thu hồi
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                    {token && canReview && (
                      <button
                        onClick={() => setActiveReplyBox(r.id)}
                        className="text-sm text-green-600 hover:underline ml-1"
                      >
                        Phản hồi
                      </button>
                    )}

                    {activeReplyBox === r.id && canReview && (
                    <div className="mt-3 ml-4 p-3 border border-gray-200 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                        {/* Avatar user */}
                        <img
                          src={currentUser.avatar || "/default-avatar.png"}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border border-green-300"
                        />

                        {/* Input */}
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={replyText[r.id] || ""}
                              onChange={(e) =>
                                setReplyText((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              placeholder="Nhập phản hồi..."
                              className="w-full px-3 py-2 text-sm border rounded-full bg-white focus:ring-2 focus:ring-green-400 outline-none"
                            />

                            {/* Nút gửi */}
                            <button
                              onClick={() => handleReply(r.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-full text-sm transition"
                            >
                              Gửi
                            </button>
                          </div>

                          {/* Nút hủy */}
                          <button
                            onClick={() => setActiveReplyBox(null)}
                            className="text-xs text-gray-500 hover:underline ml-1 mt-1"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductReview;
