import { useState, useContext} from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Login() {
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      window.toast("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("api/auth/login", form);

      if (res.data.success) {
        window.toast("🎉 Đăng nhập thành công!", "success");

        const token = res.data.token;
        const userData = { ...res.data.user, token };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        const role = userData.role;
        if (role === "admin" || role === "staff") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      window.toast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-extrabold text-green-700 text-center mb-4">
          Đăng nhập MekongFruit
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Chào mừng bạn quay lại 🌿
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="email@domain.com"
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="block w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-green-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800 transition"
            } flex items-center justify-center`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            )}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        {/* Google Login */}
        <div className="mt-5">
          <a className="text-center block mb-2 text-gray-500">Hoặc</a>
          <GoogleLoginButton />
        </div>

        {/* Links */}
        <div className="text-center mt-4 text-sm text-gray-600">
          <a href="/forgot-password" className="text-green-700 hover:underline">
            Quên mật khẩu?
          </a>
          <span className="mx-2">•</span>
          <a href="/register" className="text-green-700 hover:underline">
            Đăng ký tài khoản mới
          </a>
        </div>

        
      </div>
    </div>
  );
}

export default Login;
