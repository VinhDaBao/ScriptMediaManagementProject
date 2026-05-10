import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { sendOTP } from '../utils/sendEmail.js';

export const registerUser = async (userData) => {
    const { email, password } = userData;

    // 1. Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email đã được sử dụng.');
    }

    // 2. Mã hóa mật khẩu (Lớp bảo mật dữ liệu)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo mã OTP (6 chữ số ngẫu nhiên)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 phút

    // 4. Lưu người dùng tạm thời (isActivated: false)
    const newUser = await User.create({
        email,
        password: hashedPassword,
        otpCode: otp,
        otpExpires,
        isActivated: false
    });

    // 5. Gửi email chứa OTP
    await sendOTP(email, otp);

    return newUser;
};

export const verifyOTP = async (email, otp) => {
    // 1. Tìm người dùng theo email và mã OTP còn hạn
    const user = await User.findOne({
        email,
        otpCode: otp,
        otpExpires: { $gt: Date.now() } // Kiểm tra mã chưa hết hạn
    });

    if (!user) {
        throw new Error('Mã OTP không chính xác hoặc đã hết hạn.');
    }

    // 2. Kích hoạt tài khoản và xóa mã OTP đã dùng
    user.isActivated = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    return user;
};