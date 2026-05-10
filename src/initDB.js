import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/user.js'; // Import trực tiếp model User

dotenv.config();

const resetData = async () => {
  try {
    // Kết nối trực tiếp bằng mongoose
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Xóa sạch bảng cũ
    await User.deleteMany({});
    console.log(">>> Đã dọn sạch dữ liệu cũ.");

    // 2. Tạo dữ liệu mẫu admin
    await User.create({
      email: "diep.admin@hcmute.edu.vn",
      password: "password_da_hash_bcrypt",
      role: "admin",
      isActivated: true,
      otpCode: "123456",
      otpExpires: new Date(Date.now() + 10 * 60000),
      fullName: "Trương Quang Điệp",
      avatar: "https://i.pravatar.cc/300"
    });

    console.log(">>> Reset thành công!");
    process.exit();
  } catch (error) {
    console.error("Lỗi khởi tạo DB:", error);
    process.exit(1);
  }
};

resetData();