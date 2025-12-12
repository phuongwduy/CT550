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
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.token) {
        setUser(parsedUser);
        refreshUser().finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch {
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
