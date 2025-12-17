import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatBot() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { self: false, text: "MekongFruit Xin chào, tôi có thể giúp gì cho bạn hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // AUTO RESIZE INPUT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // LINKIFY TEXT (link nội bộ: /products/:id -> navigate)
  const renderWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part.startsWith("http")) return <span key={index}>{part}</span>;

      // Bắt link dạng: http://localhost:5173/products/123
      const match = part.match(/\/products\/(\d+)/);
      if (match) {
        const id = match[1];

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              navigate(`/products/${id}`);
              setOpen(false); // nếu KHÔNG muốn đóng chatbot thì xoá dòng này
            }}
            className="text-emerald-700 underline break-all text-left"
          >
            {part}
          </button>
        );
      }

      // Link ngoài -> mở bình thường (cùng tab)
      return (
        <a
          key={index}
          href={part}
          className="text-emerald-700 underline break-all"
        >
          {part}
        </a>
      );
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { self: true, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { self: false, text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { self: false, text: "Lỗi kết nối chatbot" }]);
    }

    setInput("");
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 z-50"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 max-w-[380px] w-[90%] sm:w-[380px] max-h-[75vh] min-h-[380px]
          bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden z-50"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex justify-between items-center">
            <span className="font-semibold text-lg text-white">
              <Bot className="inline-block mr-2" /> MekongFruit Chatbot
            </span>
            <X
              className="cursor-pointer text-white hover:text-gray-200"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.self ? "justify-end" : "justify-start"}`}
              >
                {!msg.self && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    🤖
                  </div>
                )}

                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] leading-relaxed shadow-sm whitespace-pre-line ${
                    msg.self
                      ? "bg-emerald-100 text-gray-800 rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  {renderWithLinks(msg.text)}
                </div>

                {msg.self && (
                  <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center">
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Typing */}
            {loading && (
              <div className="flex gap-2 items-center text-sm text-gray-500">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  🤖
                </div>
                <div className="bg-white border px-4 py-2 rounded-2xl shadow-sm">
                  <span className="animate-pulse">Đang trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex items-end gap-2 border-t bg-white">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none overflow-hidden focus:ring-2 focus:ring-emerald-400"
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`px-4 py-2 rounded-xl shadow-md transition ${
                input.trim() && !loading
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
