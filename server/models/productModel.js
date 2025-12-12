const db = require("../config/db");
const { getTopSelling } = require("../controllers/productController");

const ProductModel = {
  // Lấy toàn bộ sản phẩm kèm tên danh mục, nhà cung cấp và đơn vị
  async getAllProducts() {
    const sql = `
      SELECT 
        p.*, 
        c.name AS category_name,
        s.name AS supplier_name,
        u.name AS unit_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // Lấy 1 sản phẩm theo ID (có JOIN danh mục, nhà cung cấp và đơn vị)
  async getProductById(id) {
    const sql = `
      SELECT 
        p.*, 
        c.name AS category_name,
        s.name AS supplier_name,
        u.name AS unit_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.id = ? AND p.is_active = 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  // Thêm sản phẩm mới (dùng unit_id)
  async createProduct({
    name,
    description,
    price,
    category_id,
    province,
    unit_id,
    image,
    image_public_id,
    supplier_id,
    embedding,
  }) {
    const sql = `
      INSERT INTO products (name, description, price, category_id, province, unit_id, image, image_public_id, supplier_id, embedding)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      name,
      description,
      price,
      category_id,
      province,
      unit_id,
      image,
      image_public_id,
      supplier_id,
      embedding,
    ]);
    return result.insertId;
  },

  // Cập nhật sản phẩm (dùng unit_id)
  async updateProduct({
    id,
    name,
    description,
    price,
    category_id,
    province,
    unit_id,
    image,
    image_public_id,
    supplier_id,
    embedding,
  }) {
    const sql = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, category_id = ?, province = ?, unit_id = ?, image = ?, image_public_id = ?, supplier_id = ?, embedding = ?
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [
      name,
      description,
      price,
      category_id,
      province,
      unit_id,
      image,
      image_public_id,
      supplier_id,
      embedding,
      id  
    ]);
    return result.affectedRows > 0;
  },

  // Lấy public_id để xóa ảnh Cloudinary
  async getImagePublicId(id) {
    const sql = "SELECT image_public_id FROM products WHERE id = ?";
    const [rows] = await db.query(sql, [id]);
    return rows[0]?.image_public_id || null;
  },

  // Xóa sản phẩm
  async deleteProduct(id) {
    const sql = `
    UPDATE products 
    SET is_active = 0 
    WHERE id = ?
  `;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  },
  // Lấy sản phẩm theo nhà cung cấp
  async getProductsBySupplier(supplierId) {
    const sql = `
      SELECT 
        p.*, 
        c.name AS category_name,
        s.name AS supplier_name,
        u.name AS unit_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.supplier_id = ? AND p.is_active = 1
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(sql, [supplierId]);
    return rows;
  },
  
  // Lọc sản phẩm (có JOIN danh mục, nhà cung cấp và đơn vị)
  async getFilteredProducts(filters) {
    let sql = `
      SELECT 
        p.*, 
        c.name AS category_name,
        s.name AS supplier_name,
        u.name AS unit_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE p.is_active = 1   
    `;
    const params = [];

    if (filters.category_id) {
      sql += " AND p.category_id = ?";
      params.push(filters.category_id);
    }

    if (filters.price_min) {
      sql += " AND p.price >= ?";
      params.push(filters.price_min);
    }

    if (filters.price_max) {
      sql += " AND p.price <= ?";
      params.push(filters.price_max);
    }

    if (filters.search) {
      sql += " AND p.name LIKE ?";
      params.push(`%${filters.search}%`);
    }

    if (filters.province) {
      sql += " AND p.province = ?";
      params.push(filters.province);
    }

    if (filters.supplier_id) {
      sql += " AND p.supplier_id = ?";
      params.push(filters.supplier_id);
    }

    sql += " ORDER BY p.created_at DESC";

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async getTopSelling(limit = 6) {
    const sql = `
      SELECT id, name, price, image, sold_count, stock
      FROM products
      WHERE is_active = 1
      ORDER BY COALESCE(sold_count, 0) DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  },
  
};

module.exports = ProductModel;
