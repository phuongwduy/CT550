import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Toast from "../components/Toast";

function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Countdown resend
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Gửi mã xác thực
  const handleSendCode = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name.trim()) return setMessage("Vui lòng nhập họ tên.");
    if (!validateEmail(form.email)) return setMessage("Email không hợp lệ.");
    if (form.password.length < 6)
      return setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
    if (form.password !== form.confirmPassword)
      return setMessage("Mật khẩu và xác nhận mật khẩu không khớp.");

    try {
      setLoading(true);
      await axios.post("api/auth/register/request", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setMessage("📩 Mã xác thực đã được gửi đến email của bạn!");
      setStep(2);
      setTimer(60);
    } catch (error) {
      console.error("send code error:", error);
      setMessage(
        error?.response?.data?.error ||
          "Lỗi gửi mã xác thực. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xác nhận mã
  const handleConfirm = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.code.trim() || form.code.trim().length < 4)
      return setMessage("Vui lòng nhập mã xác thực hợp lệ.");

    try {
      setLoading(true);
      const res = await axios.post(
        "api/auth/register/confirm",
        {
          email: form.email,
          code: form.code,
        }
      );

      setMessage(res?.data?.message || "Xác thực thành công!");
      if (res?.status === 201 || res?.data?.success) {
        setTimeout(() => (window.location.href = "/login"), 1200);
      }
    } catch (error) {
      console.error("confirm code error:", error);
      setMessage(
        error?.response?.data?.error ||
          "Lỗi xác thực mã. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã
  const resendCode = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      await axios.post("api/auth/register/request", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setMessage("✅ Mã mới đã được gửi!");
      setTimer(60);
    } catch (error) {
      console.error("resend code error:", error);
      setMessage("Không thể gửi lại mã. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-green-100">
        <h2 className="text-2xl font-extrabold text-green-700 text-center mb-2">
          Tạo tài khoản MekongFruit
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Đăng ký nhanh chóng và bảo mật — mã xác thực sẽ được gửi qua email.
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="text-sm font-medium text-gray-700">Họ tên</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200"
                placeholder="email@domain.com"
                required
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-200"
                  placeholder="Ít nhất 6 ký tự"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Hiện/ẩn mật khẩu"
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-green-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative mt-1">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-200"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label="Hiện/ẩn xác nhận mật khẩu"
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-green-600"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } flex items-center justify-center`}
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              Đăng Ký
            </button>
          </form>
        ) : (
          // Bước 2: Nhập mã xác thực
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Mã xác thực đã được gửi tới{" "}
              <span className="font-medium text-green-700">{form.email}</span>.
            </p>

            <div>
              <label className="text-sm font-medium text-gray-700">Mã xác thực</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border rounded-lg text-center tracking-widest"
                placeholder="6 chữ số"
                inputMode="numeric"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } flex items-center justify-center`}
            >
              {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
              Xác nhận đăng ký
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

        {message && (
          <div className="fixed top-20 right-5 z-50">
            <Toast
              type={
                message.includes("✅") || message.includes("📩")
                  ? "success"
                  : message.includes("❌")
                  ? "error"
                  : "warning"
              }
              message={message}
              onClose={() => setMessage("")}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default Register;
