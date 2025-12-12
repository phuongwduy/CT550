const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Product = require("../models/productModel");
const axios = require("axios");
const FormData = require("form-data");

async function getEmbeddingFromImage(imageUrl) {
  // tải ảnh từ Cloudinary
  const resp = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(resp.data, "binary");

  // gửi sang Flask
  const formData = new FormData();
  formData.append("file", buffer, { filename: "product.jpg" });

  const pyResp = await axios.post("http://localhost:8001/embed-image", formData, {
    headers: formData.getHeaders(),
    timeout: 20000,
  });

  return JSON.stringify(pyResp.data.embedding);
}
// Cấu hình upload Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mekongfruit",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

//  Upload ảnh sản phẩm
exports.uploadImage = [
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được tải lên" });
    }
    res.json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  },
];

// Lấy tất cả sản phẩm (có lọc)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getFilteredProducts(req.query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Lỗi truy vấn CSDL" });
  }
};

// Lấy 1 sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Lỗi truy vấn CSDL" });
  }
};

//  Thêm sản phẩm
exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    category_id,
    province,
    unit_id,
    image,
    image_public_id,
    supplier_id,
  } = req.body;

  if (!name || !price || !category_id || !province || !unit_id) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ thông tin sản phẩm" });
  }
  if (price <= 0 || price > 100000000) { // giới hạn 100 triệu
    return res.status(400).json({ error: "Giá sản phẩm phải lớn hơn 0 và nhỏ hơn 100,000,000" });
  }

  try {
    let embedding = null;
    if (image) {
      try {
        embedding = await getEmbeddingFromImage(image);
      } catch (err) {
        console.error("Không tạo được embedding:", err.message);
      }
    }
    const id = await Product.createProduct({
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
    });
    res.status(201).json({ message: "Thêm sản phẩm thành công", id });
  } catch (err) {
    console.error("Lỗi thêm sản phẩm:", err);
    res.status(500).json({ error: "Không thể thêm sản phẩm" });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const {
    name,
    description,
    price,
    category_id,
    province,
    unit_id,
    image,
    image_public_id,
    supplier_id,
  } = req.body;

  try {
    let embedding = null;
    if (image) {
      try {
        embedding = await getEmbeddingFromImage(image);
      } catch (err) {
        console.error("Không tạo được embedding:", err.message);
      }
    }
    const success = await Product.updateProduct({
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
    });

    if (!success) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy sản phẩm để cập nhật" });
    }
    if (price <= 0 || price > 100000000) { // giới hạn 100 triệu
      return res.status(400).json({ error: "Giá sản phẩm phải lớn hơn 0 và nhỏ hơn 100,000,000" });
    }

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật sản phẩm" });
  }
};

// Xóa sản phẩm (và ảnh Cloudinary)
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm để xóa" });
    }

    const publicId = product.image_public_id;
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("Đã xóa ảnh Cloudinary:", publicId);
      } catch (error) {
        console.warn("Không thể xóa ảnh Cloudinary:", error);
      }
    }

    const success = await Product.deleteProduct(id);
    if (!success) {
      return res.status(500).json({ error: "Lỗi khi xóa sản phẩm khỏi cơ sở dữ liệu" });
    }

    res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xử lý yêu cầu xóa sản phẩm" });
  }
};


exports.getProductsBySupplier = async (req, res) => {
  const supplierId = req.params.supplierId;

  if (!supplierId) {
    return res.status(400).json({ error: "Thiếu mã nhà cung cấp" });
  }

  try {
    const products = await Product.getProductsBySupplier(supplierId);
    res.json(products);
  } catch (err) {
    console.error("Lỗi lấy sản phẩm theo nhà cung cấp:", err);
    res.status(500).json({ error: "Không thể lấy sản phẩm theo nhà cung cấp" });
  }
};
exports.getTopSelling = async (req, res) => {
  try {
    const limit = req.query.limit || 5; 
    const products = await Product.getTopSelling(Number(limit));

    res.json(products);
  } catch (err) {
    console.error("Lỗi lấy sản phẩm bán chạy:", err);
    res.status(500).json({ error: "Lỗi khi lấy sản phẩm bán chạy" });
  }
};
