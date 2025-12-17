import { useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userWithToken = { ...res.data, token };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));
    } catch (err) {
      console.error("❌ Lỗi khi refresh user:", err);

      
    }
  };

 useEffect(() => {
    // ✅ Dựa vào token thật trong localStorage, KHÔNG dựa vào parsedUser.token
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Set user tạm từ localStorage để Navbar không bị “thoát” khi vừa reload
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, token });
      } catch {
        setUser({ token });
      }
    } else {
      setUser({ token });
    }

    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
