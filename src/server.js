import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// Import các file nội bộ phải có đuôi .js
import connectDB from "./config/configdb.js";
import authRoutes from "./route/authRoutes.js";

// Nạp biến môi trường
dotenv.config();

const app = express();

// 1. Cấu hình Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 2. Kết nối CSDL MongoDB Atlas
connectDB();

// 3. Khởi tạo Routes
// Sử dụng prefix /api/auth cho các chức năng đăng ký, đăng nhập
app.use("/api/auth", authRoutes);

// Route kiểm tra server
app.get("/", (req, res) => {
    res.send("SMM Project API is working!");
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("--------------------------------------------------");
    console.log(`>>> SMM Project API is running on port: ${port}`);
    console.log("--------------------------------------------------");
});
