import * as authService from '../services/authService.js';
import { validationResult } from 'express-validator';
import { loginService } from '../services/authService.js';
import jwtUtil from '../utils/jwt.js';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js'; 
import User from '../models/user.js'; // BỔ SUNG: Import model User để lấy thông tin tạo token mới

// =========================================
// 1. CÁC HÀM ĐĂNG KÝ VÀ XÁC THỰC
// =========================================
export const register = async (req, res) => {
    try {
        const newUser = await authService.registerUser(req.body);
        res.status(201).json({
            message: "Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.",
            email: newUser.email
        });
    } catch (error) {
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

// =========================================
// 2. CÁC HÀM LOGIN, REFRESH TOKEN VÀ LOGOUT
// =========================================
export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors);

        const { email, password } = req.body;
        const user = await loginService(email, password);
        
        // Tạo cả 2 token
        const accessToken = jwtUtil.generateToken(user);
        const refreshToken = jwtUtil.generateRefreshToken(user);

        // Lưu Refresh Token vào Redis với thời hạn 7 ngày (604800 giây)
        await redisClient.setEx(`refresh_token:${user.id}`, 604800, refreshToken);

        const redirectUrl = user.role === "admin" ? "/admin/profile" : "/user/profile";

        return res.json({
            message: 'Login success',
            accessToken,
            refreshToken, 
            redirectUrl,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                avatar: user.avatar
            }
        });

    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

// API: Cấp lại Access Token mới khi bị hết hạn
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "Không tìm thấy Refresh Token" });

        // 1. Verify Refresh Token xem còn hạn không
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const userId = decoded.id;

        // 2. Kiểm tra xem Token này có khớp với cái đang lưu trong Redis không
        const storedToken = await redisClient.get(`refresh_token:${userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({ message: "Refresh Token không hợp lệ hoặc đã bị thu hồi. Vui lòng đăng nhập lại." });
        }

        // 3. Gọi DB để lấy thông tin User chuẩn (Thay vì xài Dummy)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Tài khoản không tồn tại. Vui lòng đăng nhập lại." });
        }

        // 4. Sinh bộ đôi Token mới (Rotation Refresh Token)
        const newAccessToken = jwtUtil.generateToken(user); 
        const newRefreshToken = jwtUtil.generateRefreshToken(user);

        // 5. Cập nhật lại Refresh Token mới vào Redis
        await redisClient.setEx(`refresh_token:${userId}`, 604800, newRefreshToken);

        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        return res.status(401).json({ message: "Refresh Token đã hết hạn. Vui lòng đăng nhập lại." });
    }
};

// API: Đăng xuất - Thu hồi Token ngay lập tức
export const logout = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // Thu hồi quyền bằng cách xóa luôn key trong Redis
        await redisClient.del(`refresh_token:${userId}`);
        
        return res.json({ message: "Đăng xuất thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server khi đăng xuất" });
    }
};