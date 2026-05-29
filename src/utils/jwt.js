import * as jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const generateToken = (user) => {
    // 1. Tạo một payload phẳng và chỉ chứa những thông tin cần thiết giống đồ án cá nhân
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName, 
        avatar: user.avatar
    };

    // 2. Ký token với payload này (bỏ dấu {} bao quanh chữ payload đi nhé)
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'});
}

export default {
    generateToken
}