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

        res.status(200).json({ message: "Tài khoản đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ." });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};