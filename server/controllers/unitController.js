const db = require("../config/db");

exports.getAllUnits = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM units ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn vị" });
  }
};

exports.createUnit = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Tên đơn vị là bắt buộc" });

  try {
    const [result] = await db.query("INSERT INTO units (name) VALUES (?)", [name]);
    res.status(201).json({ id: result.insertId, message: "Đã thêm đơn vị" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi thêm đơn vị" });
  }
};

exports.updateUnit = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await db.query("UPDATE units SET name = ?, updated_at = NOW() WHERE id = ?", [name, id]);
    res.json({ message: "Đã cập nhật đơn vị" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật đơn vị" });
  }
};

exports.deleteUnit = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM products WHERE unit_id = ?", [id]);
    if (rows[0].count > 0) {
      return res.status(400).json({
        message: `Không thể xóa vì có ${rows[0].count} sản phẩm đang sử dụng đơn vị này.`,
      });
    }

    await db.query("DELETE FROM units WHERE id = ?", [id]);
    res.json({ message: "Đã xóa đơn vị" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa đơn vị" });
  }
};
