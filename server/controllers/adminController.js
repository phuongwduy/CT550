const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await adminModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Lỗi truy vấn người dùng." });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Thiếu thông tin." });
  }

  try {
    const existing = await adminModel.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email đã tồn tại." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const defaultAvatar = "https://res.cloudinary.com/dolchpri6/image/upload/v1761997696/avatars/ix4jjgoaqi5rx5nqywh0.png";
    const userId = await adminModel.createUser(name, email, hashed, role, defaultAvatar);
    res.json({ success: true, message: "✅ Đã tạo người dùng mới.", userId });
  } catch (err) {
    res.status(500).json({ error: "Lỗi tạo người dùng." });
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "staff", "admin"].includes(role)) {
    return res.status(400).json({ error: "Vai trò không hợp lệ." });
  }

  try {
    if (req.user && Number(req.user.id) === Number(id)) {
      return res.status(400).json({ error: "Bạn không thể tự thay đổi vai trò của chính mình." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Không có quyền đổi vai trò." });
    }
    const success = await adminModel.updateUserRole(id, role);
    if (!success) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }
    res.json({ success: true, message: "✅ Đã cập nhật vai trò." });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật vai trò." });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user && Number(req.user.id) === Number(id)) {
      return res.status(400).json({
        error: "Bạn không thể tự xoá tài khoản của chính mình."
      });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Không có quyền xoá người dùng." });
    }
    const success = await adminModel.deleteUser(id);
    if (!success) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }
    res.json({ success: true, message: "Đã xóa người dùng." });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa người dùng." });
  }
};
