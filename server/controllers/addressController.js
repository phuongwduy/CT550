const AddressModel = require("../models/addressModel");
const db = require("../config/db");

const AddressController = {

  // Lấy tất cả địa chỉ của user
  getAll: async (req, res) => {
    try {
      const userId = req.user.id;
      const addresses = await AddressModel.getAllByUser(userId);
      res.json(addresses);
    } catch (err) {
      console.error("getAll error:", err);
      res.status(500).json({ message: "Lỗi khi lấy danh sách địa chỉ." });
    }
  },

  // Thêm địa chỉ mới (địa chỉ theo tỉnh → xã)
  create: async (req, res) => {
    const conn = await db.getConnection();
    try {
      const userId = req.user.id;
      const { receiver_name, phone, province_code, commune_code, detail, is_default } = req.body;

      // Validate
      if (!receiver_name || !phone || !province_code || !commune_code || !detail) {
        conn.release();
        return res.status(400).json({ message: "Thiếu thông tin địa chỉ." });
      }
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        conn.release();
        return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
      }
      await conn.beginTransaction();

      // Nếu địa chỉ này mặc định → reset các địa chỉ khác
      if (is_default) {
        await conn.query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
      }

      const id = await AddressModel.createWithConn(
        conn,
        userId,
        phone,
        receiver_name,
        province_code,
        commune_code,
        detail,
        Boolean(is_default)
      );

      await conn.commit();

      res.status(201).json({
        id,
        user_id: userId,
        receiver_name,
        phone,
        province_code,
        commune_code,
        detail,
        is_default: Boolean(is_default),
      });

    } catch (err) {
      await conn.rollback();
      console.error("create error:", err);
      res.status(500).json({ message: "Lỗi khi thêm địa chỉ." });
    } finally {
      conn.release();
    }
  },

  // Cập nhật địa chỉ
  update: async (req, res) => {
    const conn = await db.getConnection();

    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { receiver_name, phone, province_code, commune_code, detail, is_default } = req.body;

      if (!receiver_name || !phone || !province_code || !commune_code || !detail) {
        conn.release();
        return res.status(400).json({ message: "Thiếu thông tin cập nhật." });
      }
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        conn.release();
        return res.status(400).json({ message: "Vui lòng nhập số điện thoại gồm 10 chữ số và bắt đầu bằng số 0." });
      }
      await conn.beginTransaction();

      if (is_default) {
        await conn.query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
      }

      const affected = await AddressModel.updateWithConn(
        conn,
        id,
        userId,
        phone,
        receiver_name,
        province_code,
        commune_code,
        detail,
        Boolean(is_default)
      );

      if (!affected) {
        await conn.rollback();
        return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
      }

      await conn.commit();
      res.json({
        id,
        user_id: userId,
        receiver_name,
        phone,
        province_code,
        commune_code,
        detail,
        is_default: Boolean(is_default),
        message: "Cập nhật địa chỉ thành công",
      });

    } catch (err) {
      await conn.rollback();
      console.error("update error:", err);
      res.status(500).json({ message: "Lỗi khi cập nhật địa chỉ." });
    } finally {
      conn.release();
    }
  },

  // Xoá địa chỉ
  remove: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const affected = await AddressModel.remove(id, userId);
      if (!affected) {
        return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
      }

      res.json({ message: "Xoá địa chỉ thành công" });

    } catch (err) {
      console.error("remove error:", err);
      res.status(500).json({ message: "Lỗi khi xoá địa chỉ." });
    }
  },
};

module.exports = AddressController;
