const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Lấy danh sách tỉnh
router.get("/provinces", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT code, name 
      FROM provinces 
      ORDER BY name
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /provinces error:", err);
    res.status(500).json({ message: "Không thể lấy danh sách tỉnh." });
  }
});

// Lấy danh sách xã theo tỉnh
router.get("/communes/:province_code", async (req, res) => {
  const { province_code } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT code, name, codename 
      FROM communes 
      WHERE province_code = ?
      ORDER BY name
      `,
      [province_code]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /communes error:", err);
    res.status(500).json({ message: "Không thể lấy danh sách xã/phường." });
  }
});

module.exports = router;
