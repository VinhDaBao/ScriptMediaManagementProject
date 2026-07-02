import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { sendOTP } from '../utils/sendEmail.js';
import mongoose from 'mongoose';
export const registerUser = async (userData) => {
    const { email, password } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000);

    const newUser = await User.create({
        email,
        password: hashedPassword,
        otpCode: otp,
        otpExpires,
        isActivated: false
    });

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
        throw new Error('The OTP is invalid or has expired.');
    }

    // 2. Kích hoạt tài khoản và xóa mã OTP đã dùng
    user.isActivated = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
};

export const loginService = async (email, password) => {
    const user = await User.findOne({ email });
    console.log(user)
    console.log('Database:', mongoose.connection.db?.databaseName);
    console.log('Host:', mongoose.connection.host);
    if (!user) {
        throw new Error('User not found.');
    }

    if (user.isActivated === false) {
        throw new Error('Your account has not been activated with an OTP.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password.');
    }
    return user;
};