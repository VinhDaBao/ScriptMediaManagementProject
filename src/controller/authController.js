import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        // Dữ liệu lúc này đã đi qua bộ lọc Validation ở Middleware
        const newUser = await authService.registerUser(req.body);

        // Trả về mã 201 (Created) khi đăng ký bước đầu thành công
        res.status(201).json({
            message: "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.",
            email: newUser.email
        });
    } catch (error) {
        // Xử lý các lỗi nghiệp vụ (như trùng email) trả về từ Service
        res.status(400).json({ message: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        await authService.verifyOTP(email, otp);

        res.status(200).json({ errCode: 0, message: "Tài khoản đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ." });
    } catch (error) {
        res.status(400).json({ errCode: 1,message: error.message });
    }
};
import { validationResult } from 'express-validator'

import { loginService } from '../services/authService.js'

import generateToken from '../utils/jwt.js'

export const login = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json(errors)
        }

        const { email, password } = req.body
        const user = await loginService(email, password)
        const token = generateToken.generateToken(user)

        // THÊM ĐOẠN NÀY: Xử lý redirectUrl dựa vào role giống đồ án cá nhân
        const redirectUrl = user.role === "admin" ? "/admin/profile" : "/user/profile";

        return res.json({
            message: 'Login success',
            token,
            redirectUrl,

            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                avatar: user.avatar
            }
        })

    } catch (error) {
        return res.status(401).json({
            message: error.message
        })
    }
}