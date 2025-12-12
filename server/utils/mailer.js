const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendVerificationCode = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
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
        <p>Dưới đây là mã xác thực của bạn:</p>
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
            ${code}
          </div>
        </div>

        <p style="font-size:14px; color:#555;">
          Mã có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
        </p>

        <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />

        <p style="font-size:13px; color:#777;">
          Nếu bạn không yêu cầu mã xác thực này, vui lòng bỏ qua email này.<br>
          Trân trọng,<br>
          <b>Đội ngũ MekongFruit</b>
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"MekongFruit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã xác thực đăng ký tài khoản',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Gửi email thành công:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    throw new Error('Gửi email thất bại');
  }
};
