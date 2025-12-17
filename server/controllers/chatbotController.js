const Groq = require("groq-sdk");
const db = require("../config/db");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.askChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    // Lấy dữ liệu sản phẩm
    const [products] = await db.query(`
      SELECT id, name, price, province, stock, description, sold_count
      FROM products
      WHERE is_active = 1
    `);

    const context = products
      .map(
        (p) => `
              ${p.id}
            - ${p.name}
              Giá: ${p.price}đ
              Xuất xứ: ${p.province}
              Tồn kho: ${p.stock}
              Đã bán: ${p.sold_count}
              Mô tả: ${p.description || "Không có mô tả"}
              Link sản phẩm: http://localhost:5173/products/${p.id}`
                  )
      .join("\n");

    const systemMessage = `
      Bạn là chatbot tư vấn trái cây miền Tây.
      Trả lời thân thiện, ngắn gọn và dựa trên dữ liệu sau:

    ${context}
    khi nào sản phẩm có thì nhớ thêm link sản phẩm vào
    phí ship thường là 15,000đ trong nội thành hay Cà Mau.
    các tỉnh ở miền tây nam bộ phí ship là 25,000đ.
    các tỉnh khác phí ship là 35,000đ.
    Nếu đơn hàng trên 500,000đ thì miễn phí ship.
    Thời gian, nếu là cà mau có thể giao trong ngày hoặc hơn, các tỉnh miền tây cỡ 2 ngày, còn tỉnh khác 3-4 ngày.
    `;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message },
      ],
      temperature: 0.6,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot Groq error:", err);
    res
      .status(500)
      .json({ error: "Chatbot failed", detail: err.message || String(err) });
  }
};
