import userService from "../services/userService";

// --- VALIDATION HELPER ---
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 1. Chức năng Quên mật khẩu
let handleForgotPassword = async (req, res) => {
    let email = req.body.email;

    if (!email) return res.status(200).json({ errCode: 1, message: 'Vui lòng nhập Email!' });
    if (!isValidEmail(email)) return res.status(200).json({ errCode: 1, message: 'Định dạng Email không hợp lệ!' });

    let response = await userService.sendOTPtoEmail(email);
    return res.status(200).json(response);
}

// 2. Chức năng Xác nhận mã & Đổi mật khẩu
let handleResetPassword = async (req, res) => {
    let { email, otp, newPassword } = req.body;

    // VALIDATION: Kiểm tra tính đầy đủ và định dạng
    if (!email || !otp || !newPassword) {
        return res.status(200).json({ errCode: 1, message: 'Vui lòng điền đầy đủ Email, OTP và Mật khẩu mới!' });
    }
    if (otp.length !== 6) {
        return res.status(200).json({ errCode: 1, message: 'Mã OTP phải có đúng 6 chữ số!' });
    }
    if (newPassword.length < 6) {
        return res.status(200).json({ errCode: 1, message: 'Mật khẩu mới phải từ 6 ký tự trở lên để đảm bảo an toàn!' });
    }

    let response = await userService.resetPassword(req.body);
    return res.status(200).json(response);
}

// 3. Chức năng Chỉnh sửa hồ sơ
let handleEditProfile = async (req, res) => {
    try {
        let data = req.body;
        // Trong thực tế, ID sẽ lấy từ JWT Token.
        // Ở đây check email để định danh User cần sửa.
        if (!data.email) return res.status(200).json({ errCode: 1, message: 'Không tìm thấy thông tin định danh người dùng!' });
        
        if (data.fullName && data.fullName.length < 2) {
            return res.status(200).json({ errCode: 1, message: 'Họ tên không được để trống hoặc quá ngắn!' });
        }

        let message = await userService.handleUpdateProfile(data);
        return res.status(200).json(message);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: 'Lỗi từ hệ thống server...'
        });
    }
};

module.exports = {
    handleForgotPassword,
    handleResetPassword,
    handleEditProfile
}