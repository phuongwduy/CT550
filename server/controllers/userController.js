const userModel = require("../models/userModel");
const cloudinary = require("../config/cloudinary");
const db = require("../config/db");
const streamifier = require("streamifier");
const bcrypt = require("bcryptjs");

//  Cập nhật thông tin người dùng
exports.updateUserInfo = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;

  if (!name && !phone && !address) {
    return res.status(400).json({ message: "Không có thông tin nào để cập nhật" });
  }

  try {
    const success = await userModel.updateUser(userId, name || "", phone || "", address || "");
    if (!success) {
      return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật" });
    }
    res.json({ message: " Cập nhật thông tin thành công" });
  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

//  Lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

//  Cập nhật avatar người dùng
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Không có file ảnh." });

    // Upload từ buffer bằng stream
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "avatars", resource_type: "image" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload(req.file.buffer);

    // Cập nhật vào DB
    const sql = "UPDATE users SET avatar = ? WHERE id = ?";
    const [updateResult] = await db.query(sql, [result.secure_url, req.user.id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng để cập nhật avatar" });
    }

    res.json({ success: true, avatar: result.secure_url });
  } catch (err) {
    console.error(" Lỗi cập nhật avatar:", err);
    res.status(500).json({ error: "Lỗi server." });
  }
};
exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }

    const user = results[0];

    if (!user.verified) {
      return res.status(403).json({ error: "Tài khoản chưa xác thực email." });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: "Mật khẩu cũ không đúng." });
    }
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({ error: "Mật khẩu mới phải khác mật khẩu hiện tại." });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashed, email]);

    res.json({ success: true, message: "Mật khẩu đã được cập nhật thành công." });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ error: "Không thể đổi mật khẩu." });
  }
};