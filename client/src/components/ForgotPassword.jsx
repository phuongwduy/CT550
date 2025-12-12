import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Toast from "../components/Toast";
import { useEffect } from "react";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(0);


    useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("api/auth/forgot/request", { email });
      setToast({ type: "success", message: "Mã xác thực đã được gửi đến email!" });
      setTimer(60);
      setStep(2);
    } catch (error) {
      console.error("Lỗi gửi mã:", error);
      setToast({ type: "error", message: error.response?.data?.error || "Không thể gửi mã." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("api/auth/forgot/confirm", {
        email,
        code,
        newPassword,
      });
      setToast({ type: "success", message: "Mật khẩu đã được đặt lại thành công!" });
      setTimeout(() => window.location.href = "/login", 1500);
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      setToast({ type: "error", message: error.response?.data?.error || "Không thể đặt lại mật khẩu." });
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
  try {
    setLoading(true);
    await axios.post("api/auth/forgot/request", { email });
    setToast({ type: "success", message: "Mã xác thực mới đã được gửi!" });
    setTimer(60);
  } catch (error) {
    console.error("Lỗi gửi lại mã:", error);
    setToast({ type: "error", message: error.response?.data?.error || "Không thể gửi lại mã." });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-green-100">
        
        <h2 className="text-2xl font-bold text-green-700 mb-4">Quên mật khẩu</h2>
        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Nhập email để nhận mã xác thực đặt lại mật khẩu.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
              placeholder="Email của bạn"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } flex items-center justify-center`}
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              Gửi mã xác thực
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="text-sm text-green-600 hover:underline"
            >
              ← Trở lại đăng nhập
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Nhập mã xác thực và mật khẩu mới để hoàn tất.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
              placeholder="Mã xác thực 6 chữ số "
              inputMode="numeric"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
              placeholder="Mật khẩu mới"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } flex items-center justify-center`}
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              Đặt lại mật khẩu
            </button>
            <div className="text-center mt-2">
              {timer > 0 ? (
                <span className="text-sm text-gray-500">
                  Gửi lại mã sau {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-sm text-green-600 hover:underline"
                >
                  Gửi lại mã xác thực
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {toast && (
        <div className="fixed top-20 right-5 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
