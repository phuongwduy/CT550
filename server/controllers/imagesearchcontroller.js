const axios = require("axios");
const db = require("../config/db");
const FormData = require("form-data");

// Cosine Similarity
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return -1;
  if (a.length !== b.length) return -1;

  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return -1;

  return dot / denom;
}

// Tìm kiếm sản phẩm theo hình ảnh
exports.searchByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng tải lên 1 hình ảnh." });
    }

    // 1) Gửi ảnh sang Python CLIP service để lấy embedding
    const formData = new FormData();
    formData.append("file", req.file.buffer, { filename: "query.jpg" });

    const pyResp = await axios.post(
      "http://localhost:8001/embed-image",
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 20000,
      }
    );

    const queryVec = pyResp.data.embedding;
    if (!Array.isArray(queryVec)) {
      console.error("queryVec không phải array:", queryVec);
      return res.status(500).json({ error: "Embedding truy vấn không hợp lệ." });
    }


    // 2) Lấy embedding sản phẩm từ DB
    const [products] = await db.query(`
      SELECT id, name, price, image, province, embedding
      FROM products
      WHERE is_active = 1 AND embedding IS NOT NULL
    `);

    if (!products.length) {
      return res.json({ success: true, results: [] });
    }

    // 3) Tính similarity
    const scored = products
      .map((p) => {
        let raw = p.embedding;
        let vec = null;

        // Nếu là string -> JSON.parse
        if (typeof raw === "string") {
          try {
            vec = JSON.parse(raw);
          } catch (e) {
            console.error(`Lỗi parse embedding sản phẩm ${p.id}:`, e.message);
            vec = null;
          }
        }
       
        else if (Array.isArray(raw)) {
          vec = raw;
        } else if (raw && typeof raw === "object") {

          vec = Object.values(raw);
        }

        const similarity = cosineSimilarity(queryVec, vec);

        console.log(
          `Product ${p.name} similarity:`,
          similarity,
          "| vec type:",
          typeof raw
        );

        return {
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          province: p.province,
          similarity,
        };
      })
      .filter((p) => Number.isFinite(p.similarity) && p.similarity >= 0);

    // 4) Sắp xếp giảm dần
    scored.sort((a, b) => b.similarity - a.similarity);
    return res.json({
      success: true,
      results: scored.slice(0, 2),
    });
  } catch (err) {
    console.error("Image search error:", err);
    return res.status(500).json({
      success: false,
      error: "Image search failed",
      detail: err.message,
    });
  }
};
