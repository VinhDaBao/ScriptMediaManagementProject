import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName, 
        avatar: user.avatar
    };
    // Access Token hạ xuống sống 15 phút cho bảo mật
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE });
}

const generateRefreshToken = (user) => {
    const payload = { id: user.id }; // Refresh Token chỉ cần lưu ID là đủ
    // Refresh Token sống 7 ngày
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
}

export default {
    generateToken,
    generateRefreshToken
}