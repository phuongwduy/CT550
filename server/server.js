const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use("/images", express.static("public/images"));

const path = require("path"); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const avatarRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require("./routes/addressRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const unitRoutes = require("./routes/unitRoutes");
const inventoryRouter = require("./routes/inventoryRouter");
const couponRouter = require("./routes/couponRoute");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const batchRoutes = require("./routes/batchRoutes");
const locationRoutes = require("./routes/locationRoutes");
const chatbotRoutes = require("./routes/chatbot");
const imageSearchRoutes = require("./routes/imagesearchRoute");



app.use("/api", imageSearchRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/user", avatarRoutes);
app.use("/api/products", productRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user/address", addressRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/inventory", inventoryRouter);
app.use("/api/coupons", couponRouter )
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", batchRoutes);
app.use("/api", locationRoutes);
app.use("/api/chatbot", chatbotRoutes);


app.get('/', (req, res) => {
  res.send('API đang chạy...');
});

(async () => {
  try {
    await db.query('SELECT 1');
    console.log(' Database đã kết nối thành công!');
  } catch (err) {
    console.error('Lỗi kết nối Database:', err.message);
  }

  app.listen(5000, () => {
    console.log('Server chạy tại http://localhost:5000');
  });
})();

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  } else {
    next();
  }
});
