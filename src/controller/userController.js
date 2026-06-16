import userService from "../services/userService.js";
import User from "../models/user.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleForgotPassword = async (req, res) => {
    let email = req.body.email;
    if (!email) return res.status(200).json({ errCode: 1, message: 'Nhập Email!' });
    
    let response = await userService.sendOTPtoEmail(email);
    return res.status(200).json(response);
}

const handleVerifyForgotPasswordOTP = async (req, res) => {
    let response = await userService.verifyForgotPasswordOTP(req.body);
    return res.status(200).json(response);
}

const handleResetPassword = async (req, res) => {
    let response = await userService.resetPassword(req.body);
    return res.status(200).json(response);
}

const handleEditProfile = async (req, res) => {
    try {
        let data = req.body;
        if (req.file) {
            data.avatar = `/images/avatar/${req.file.filename}`;
        }
        let message = await userService.handleUpdateProfile(req.user, data);
        return res.status(200).json(message);
    } catch (e) {
        return res.status(200).json({ errCode: -1, message: 'Lỗi server...' });
    }
};

const handleToggleUserStatus = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        
        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ errCode: 1, message: 'Không tìm thấy người dùng này!' });
        }
        
        if (user.role === 'admin') {
            return res.status(403).json({ errCode: 2, message: 'Không thể khóa tài khoản của Admin khác!' });
        }

        // Đảo ngược trạng thái (Đang true thì thành false, đang false thì thành true)
        user.isActivated = !user.isActivated; 
        await user.save();

        const statusMessage = user.isActivated ? "Đã mở khóa tài khoản thành công!" : "Đã khóa tài khoản thành công!";
        return res.status(200).json({ errCode: 0, message: statusMessage, isActivated: user.isActivated });

    } catch (error) {
        console.error("Lỗi khóa tài khoản:", error);
        return res.status(500).json({ errCode: -1, message: 'Lỗi server khi cập nhật trạng thái User' });
    }
};

export default {
    handleForgotPassword,
    handleVerifyForgotPasswordOTP,
    handleResetPassword,
    handleEditProfile,
    handleToggleUserStatus
};