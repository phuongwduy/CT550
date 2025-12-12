import { useEffect } from "react";
import { X } from "lucide-react";

function Toast({ type = "info", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2000); // tồn tại 2s
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
  };

  return (
    <div
      className={`flex items-center justify-between border-l-4 px-5 py-3 rounded-xl shadow-lg ${styles[type]} animate-toast-enter backdrop-blur-sm`}
      style={{ minWidth: "400px", maxWidth: "600px" }}
    >
      <p className="text-base font-semibold leading-snug pr-3">{message}</p>
      <button
        onClick={onClose}
        className="ml-3 text-gray-500 hover:text-gray-700 transition"
      >
        <X size={24} />
      </button>
    </div>
  );
}

export default Toast;
