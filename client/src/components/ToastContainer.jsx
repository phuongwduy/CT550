import { useState, useCallback } from "react";
import Toast from "./Toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // expose addToast ra global (để gọi từ mọi nơi)
  window.toast = addToast;

  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          message={t.message}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}
