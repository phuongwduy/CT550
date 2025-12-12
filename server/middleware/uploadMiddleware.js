const multer = require("multer");

// Lưu file vào bộ nhớ RAM (buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

module.exports = upload;
