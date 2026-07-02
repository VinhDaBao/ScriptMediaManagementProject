import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/user.js'; // Import model User để kiểm tra dữ liệu bên trong

const checkDatabase = async () => {
  try {
    // 1. Kết nối DB theo chuỗi URI trong file .env
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("\n==================================================");
    console.log(`>>> TÊN DATABASE ĐANG KẾT NỐI: [ ${mongoose.connection.name} ]`);
    console.log("==================================================");

    // 2. Liệt kê tất cả các collections (bảng) đang có
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(">>> CÁC BẢNG (COLLECTIONS) ĐANG CÓ:");
    
    if (collections.length === 0) {
      console.log(" ❌ (Trống rỗng - Chưa có bảng nào được tạo trong Database này!)");
    } else {
      collections.forEach(col => console.log(`  - ${col.name}`));
      
      console.log("--------------------------------------------------");
      // 3. Kiểm tra xem bảng 'users' có dữ liệu chưa và in ra thử
      const userCount = await User.countDocuments({});
      console.log(`>>> TỔNG SỐ USER TRONG BẢNG 'users': ${userCount}`);
      
      if (userCount > 0) {
        const allUsers = await User.find({}).select('-password'); // Lấy hết user, ẩn password cho bảo mật
        console.log(">>> DANH SÁCH USER HIỆN TẠI:");
        console.log(JSON.stringify(allUsers, null, 2));
      } else {
        console.log(" ❌ Bảng 'users' đang trống rỗng, chưa có bản ghi nào!");
      }
    }
    console.log("==================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error while scanning the database:", error);
    process.exit(1);
  }
};

checkDatabase();