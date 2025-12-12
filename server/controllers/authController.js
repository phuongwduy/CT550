const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendVerificationCode } = require("../utils/mailer");

//  Yêu cầu mã xác thực
exports.requestVerification = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const existing = results[0];

    const hashed = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 5 * 60 * 1000);
    const defaultAvatar = "https://res.cloudinary.com/dolchpri6/image/upload/v1761997696/avatars/ix4jjgoaqi5rx5nqywh0.png";

    if (!existing) {
      // Tạo mới
      await db.query(
        "INSERT INTO users (name, email, password, avatar, verification_code, code_expire, verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
        [name, email, hashed, defaultAvatar, code, expire]
      );
    } else if (existing.verified && !existing.is_deleted) {
      // Đã xác thực và đang hoạt động → chặn đăng ký lại
      return res.status(400).json({ error: "Email này đã được đăng ký." });
    } else if (existing.is_deleted && !existing.verified) {
      // Tài khoản bị xoá nhưng chưa xác thực → reset lại
      await db.query(
        "UPDATE users SET name = ?, password = ?, avatar = ?, verification_code = ?, code_expire = ?, verified = 0, is_deleted = 0 WHERE email = ?",
        [name, hashed, defaultAvatar, code, expire, email]
      );
    } else {
      //Tài khoản chưa xác thực → cập nhật mã mới
      await db.query(
        "UPDATE users SET name = ?, password = ?, verification_code = ?, code_expire = ? WHERE email = ?",
        [name, hashed, code, expire, email]
      );
    }

    sendVerificationCode(email, code);
    await db.query("DELETE FROM users WHERE verified = 0 AND code_expire < NOW()");
    res.json({ message: "📩 Mã xác thực đã được gửi đến email của bạn." });
  } catch (err) {
    console.error("Lỗi xác thực:", err);
    res.status(500).json({ error: "Không thể xử lý yêu cầu xác thực." });
  }
};


// Xác nhận mã xác thực
exports.confirmVerification = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Thiếu thông tin xác thực." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }

    const user = results[0];

    if (user.is_deleted) {
      return res.status(403).json({ error: "Tài khoản đã bị xoá hoặc bị khoá." });
    }

    if (user.verified) {
      return res.status(400).json({ error: "Tài khoản này đã được xác thực trước đó." });
    }

    if (!user.verification_code || user.verification_code !== code) {
      return res.status(400).json({ error: "Mã xác thực không chính xác." });
    }

    if (new Date() > new Date(user.code_expire)) {
      return res.status(400).json({ error: "Mã xác thực đã hết hạn. Vui lòng đăng ký lại." });
    }

    await db.query(
      "UPDATE users SET verified = 1, verification_code = NULL, code_expire = NULL WHERE email = ?",
      [email]
    );

    res.json({ success: true, message: "🎉 Xác thực tài khoản thành công!" });
  } catch (err) {
    console.error("Lỗi xác nhận:", err);
    res.status(500).json({ error: "Lỗi xác nhận tài khoản." });
  }
};


//  Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: "Email không tồn tại." });
    }

    const user = results[0];

    if (user.is_deleted) {
      return res.status(403).json({ error: "Tài khoản đã bị xoá hoặc bị khoá." });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Tài khoản chưa xác thực email." });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Sai mật khẩu." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: token,
    };

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi truy vấn CSDL." });
  }
};
// Quên mật khẩu: gửi mã xác thực
exports.forgotPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Vui lòng nhập email." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Email không tồn tại." });
    }
    const user = results[0]
    if (user.is_deleted) {
      return res.status(403).json({ error: "Tài khoản đã bị xoá hoặc bị khoá." });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Tài khoản chưa xác thực email." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await db.query(
      "UPDATE users SET verification_code = ?, code_expire = ? WHERE email = ?",
      [code, expire, email]
    );

    sendVerificationCode(email, code);
    res.json({ message: "📩 Mã xác thực đã được gửi đến email của bạn." });
  } catch (err) {
    console.error("Lỗi gửi mã quên mật khẩu:", err);
    res.status(500).json({ error: "Không thể xử lý yêu cầu." });
  }
};
// Quên mật khẩu: xác nhận mã và đặt lại mật khẩu
exports.forgotPasswordConfirm = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản." });
    }

    const user = results[0];

    if (!user.verification_code || user.verification_code !== code) {
      return res.status(400).json({ error: "Mã xác thực không chính xác." });
    }

    if (new Date() > new Date(user.code_expire)) {
      return res.status(400).json({ error: "Mã xác thực đã hết hạn." });
    }
    if (user.is_deleted) {
      return res.status(403).json({ error: "Tài khoản đã bị xoá hoặc bị khoá." });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Tài khoản chưa xác thực email." });
    }

    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({ error: "Mật khẩu mới phải khác mật khẩu hiện tại." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, verification_code = NULL, code_expire = NULL WHERE email = ?",
      [hashed, email]
    );

    res.json({ success: true, message: "🔐 Mật khẩu đã được đặt lại thành công!" });
  } catch (err) {
    console.error("Lỗi xác nhận quên mật khẩu:", err);
    res.status(500).json({ error: "Không thể đặt lại mật khẩu." });
  }
};


const { OAuth2Client } = require("google-auth-library");
const adminModel = require("../models/adminModel");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Thiếu token Google." });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Kiểm tra user tồn tại chưa
    let user = await adminModel.getUserByEmail(email);

    // Nếu chưa → tạo mới
    if (!user) {
      const hashed = await bcrypt.hash(googleId, 10);

      const newUserId = await adminModel.createUser(
        name,
        email,
        hashed,
        "user",
        picture,
        true,
        "google"
      );

      user = await adminModel.getUserById(newUserId);
    }

    if (user.is_deleted === 1) {
      return res.status(403).json({ error: "Tài khoản đã bị khóa." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập Google thành công.",
      token,
      user,
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Lỗi đăng nhập Google." });
  }
};

