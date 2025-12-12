import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function GoogleLoginButton() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Callback khi Google trả về credential
  const handleCallback = async (response) => {
    try {
      const res = await axios.post("/api/auth/google", {
        credential: response.credential,
      });

      // Lưu token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      window.toast("🎉 Đăng nhập Google thành công!", "success");

      const role = res.data.user.role;

      if (role === "admin" || role === "staff") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      window.toast(
        err.response?.data?.error || "Đăng nhập Google thất bại.",
        "error"
      );
    }
  };

  // Render button Google
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCallback,
    });

    google.accounts.id.renderButton(
      document.getElementById("google_btn"),
      {
        theme: "outline",
        size: "large",
        width: "100%",
      }
    );
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div id="google_btn"></div>
    </div>
  );
}

export default GoogleLoginButton;
