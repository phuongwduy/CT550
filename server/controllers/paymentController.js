const db = require("../config/db");
const QRCode = require("qrcode");
// =========================
// HÀM LẤY PAYPAL ACCESS_TOKEN
// =========================
async function getPaypalToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch(`${process.env.PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("PayPal token error:", err);
    throw new Error("PayPal token request failed");
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

// =========================
// PAYMENT CONTROLLER
// =========================
const PaymentController = {

  // ==========================================
  // 1) TẠO THANH TOÁN PAYPAL
  // ==========================================
  paypalCheckout: async (req, res) => {
    try {
      const { order_id } = req.body;
      if (!order_id)
        return res.status(400).json({ message: "Thiếu order_id" });

      // Lấy đơn hàng
      const [[order]] = await db.query(
        "SELECT total_price, order_code FROM orders WHERE id = ?",
        [order_id]
      );

      if (!order)
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

      // Chuyển trạng thái đơn
      await db.query(
        "UPDATE orders SET status='pending', updated_at=NOW() WHERE id=?",
        [order_id]
      );

      // Convert VND -> USD
      const rate = process.env.EXCHANGE_RATE || 24500;
      const usdAmount = (order.total_price / rate).toFixed(2);

      // TOKEN PAYPAL
      const token = await getPaypalToken();

      // Tạo order PayPal
      const orderRes = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          application_context: {
            brand_name: "MienTayFruits",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `http://localhost:5173/paypal-success`,
            cancel_url: `http://localhost:5173/checkout`,
          },
          purchase_units: [
            {
              reference_id: order.order_code,
              amount: {
                currency_code: "USD",
                value: usdAmount,
              },
            },
          ],
        }),
      });

      const data = await orderRes.json();

      if (!orderRes.ok) {
        console.error("PayPal create order error:", data);
        return res.status(400).json({ message: "PayPal order error", data });
      }

      // Lấy approve link
      const approveUrl = data.links?.find(l => l.rel === "approve")?.href;

      if (!approveUrl)
        return res.status(400).json({ message: "approveUrl not found" });

      // Lưu paypal_order_id
      await db.query(
        `INSERT INTO payments(order_id, payment_method, payment_status, amount, paypal_order_id)
         VALUES (?, 'PAYPAL', 'PENDING', ?, ?)
         ON DUPLICATE KEY UPDATE 
            payment_status='PENDING',
            paypal_order_id=?`,
        [order_id, order.total_price, data.id, data.id]
      );

      return res.json({
        message: "Khởi tạo thanh toán PayPal thành công",
        paypalOrderId: data.id,
        approveUrl,
        usd_amount: usdAmount,
      });

    } catch (error) {
      console.error("paypalCheckout error:", error);
      res.status(500).json({ message: "SERVER_ERROR" });
    }
  },

  // ==========================================
  // 2) XÁC NHẬN THANH TOÁN PAYPAL
  // ==========================================
  paypalCapture: async (req, res) => {
    try {
      const { paypalOrderId, order_id } = req.body;

      if (!order_id)
        return res.status(400).json({ message: "Thiếu order_id" });

      const [[order]] = await db.query(
        "SELECT user_id FROM orders WHERE id = ?",
        [order_id]
      );
      // Nếu FE không gửi paypalOrderId → lấy từ DB
      let ppOrderId = paypalOrderId;

      if (!ppOrderId) {
        const [[payment]] = await db.query(
          "SELECT paypal_order_id FROM payments WHERE order_id=? AND payment_method='PAYPAL'",
          [order_id]
        );
        ppOrderId = payment?.paypal_order_id;
      }

      if (!ppOrderId)
        return res.status(400).json({ message: "Thiếu paypalOrderId" });

      // Lấy token
      const token = await getPaypalToken();

      // Capture
      const captureRes = await fetch(
        `${process.env.PAYPAL_API}/v2/checkout/orders/${ppOrderId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await captureRes.json();
      const userId = order.user_id;
      if (!captureRes.ok) {
        console.error("PayPal capture error:", data);
        return res.status(400).json({ message: "Capture failed", data });
      }

      // Nếu thành công
      if (data.status === "COMPLETED") {
        await db.query(
          `UPDATE payments 
           SET payment_status='COMPLETED', payment_date=NOW() 
           WHERE order_id=? AND payment_method='PAYPAL'`,
          [order_id]
        );

        await db.query(
          "UPDATE orders SET status='pending', updated_at=NOW() WHERE id=?",
          [order_id]
        );
        await db.query("DELETE FROM carts WHERE user_id = ?", [userId]);
      }

      return res.json({
        message: "Thanh toán thành công",
        paypal_response: data,
      });

    } catch (error) {
      console.error("paypalCapture error:", error);
      res.status(500).json({ message: "SERVER_ERROR" });
    }
  },

};

module.exports = PaymentController;
