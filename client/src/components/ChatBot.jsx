import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { self: false, text: "MekongFruit Xin chào, tôi có thể giúp gì cho bạn hôm nay?" }
    ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto resize input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      setMessages((prev) => [
        ...prev,
        { self: false, text: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { self: false, text: "Lỗi kết nối chatbot" },
      ]);
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
          className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-xl backdrop-blur-md transition-transform hover:scale-110 z-50"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 max-w-[380px] w-[90%] sm:w-[380px] max-h-[75vh] min-h-[380px] h-auto 
        bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-[slideIn_.25s_ease-out] z-50">
          {/* Header */}
          <div className=" bg-emerald-600  p-4 flex justify-between items-center">
            <span className="font-semibold text-lg text-white"> <Bot className="inline-block mr-2" /> MekongFruit Chatbot</span>
            <X
              className="cursor-pointer hover:text-gray-200 transition text-white"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  msg.self ? "justify-end" : "justify-start"
                }`}
              >
                {/* Bot Avatar */}
                {!msg.self && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    🤖
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] leading-relaxed shadow-sm ${
                    msg.self
                      ? "bg-emerald-100 text-gray-800 rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* User Avatar */}
                {msg.self && (
                  <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center">
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500 text-white">
                  🤖
                </div>
                <div className="bg-white border px-4 py-2 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex items-end border-t bg-white gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 resize-none overflow-hidden"
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
