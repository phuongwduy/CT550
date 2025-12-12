const Category = require('../models/categoryModel');

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi truy vấn CSDL' });
  }
};

// Thêm danh mục
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  }

  try {
    const categoryId = await Category.create(name, description);
    res.status(201).json({ message: 'Thêm danh mục thành công', categoryId });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thêm danh mục' });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const success = await Category.update(id, name, description);
    if (!success) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật danh mục' });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const success = await Category.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa danh mục' });
  }
};
