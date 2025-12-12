const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendCouponEmail = async (email, coupon) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 10px;
        color: #333;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      ">
        <p>Xin chào <b>${email}</b>,</p>
        <p>Đây là mã giảm giá cho bạn từ <b>MekongFruit</b>:</p>

        <div style="text-align:center; margin:20px 0;">
          <div style="
            display:inline-block;
            font-size:24px;
            font-weight:bold;
            color:#fff;
            background-color:#008037;
            padding:12px 40px;
            border-radius:10px;
            letter-spacing:2px;
            box-shadow:0 3px 8px rgba(0,0,0,0.2);
          ">
            ${coupon.code}
          </div>
        </div>

        <div style="font-size:15px; line-height:1.6; color:#444;">
          <p>🔸 Giảm: <b>${coupon.discount_value}${coupon.discount_type === "percent" ? "%" : "₫"}</b></p>
          <p>🔸 Đơn tối thiểu: <b>${Number(coupon.min_order || 0).toLocaleString("vi-VN")}₫</b></p>
          <p>🔸 Giảm tối đa: <b>${Number(coupon.max_discount || 0).toLocaleString("vi-VN")}₫</b></p>
          <p>🔸 Hạn dùng: <b>${coupon.expires_at ? coupon.expires_at : "Không xác định"}</b></p>
        </div>

        <p style="font-size:14px; color:#555; margin-top:20px;">
          Mã có thể áp dụng khi mua hàng tại website hoặc cửa hàng MekongFruit. Vui lòng không chia sẻ mã này với người khác.
        </p>

        <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />

        <p style="font-size:13px; color:#777;">
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.<br>
          Trân trọng,<br>
          <b>Đội ngũ MekongFruit</b>
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"MekongFruit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã giảm giá dành riêng cho bạn!",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Gửi mã giảm giá thành công:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Lỗi gửi mã giảm giá:", error);
    throw new Error("Gửi mã giảm giá thất bại");
  }
};
