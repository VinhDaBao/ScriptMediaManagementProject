import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/user.js'; 

const resetData = async () => {
  try {
    // 1. Kết nối Database
    await mongoose.connect(process.env.MONGO_URI);
    
    // 2. Xóa sạch dữ liệu cũ
    await User.deleteMany({});
    console.log(">>> Old data in the users table has been cleared.");

    // 3. Tạo dữ liệu mẫu Admin (Dùng mail sinh viên của ông cho thực tế)
    await User.create({
      email: "23110205@student.hcmute.edu.vn",
      password: "password_da_hash_bcrypt", 
      role: "admin", // BẮT BUỘC giữ cái này để có quyền Admin
      isActivated: true,
      otpCode: "123456",
      otpExpires: new Date(Date.now() + 10 * 60000), 
      fullName: "Trương Quang Điệp",
      avatar: "https://i.pravatar.cc/300" 
    });

    console.log(">>> Reset completed successfully. New data has been pushed to MongoDB Atlas.");
    process.exit(0);
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
};

resetData();