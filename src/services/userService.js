const db = require('../models/index');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mailer');
const salt = bcrypt.genSaltSync(10);

// 1. Hàm yêu cầu gửi OTP
let sendOTPtoEmail = async (email) => {
    try {
        let user = await db.User.findOne({ email: email });
        if (!user) return { errCode: 1, message: 'Email không tồn tại trong hệ thống!' };

        // Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Lưu mã vào DB và đặt hạn dùng 5 phút
        user.otpCode = otp;
        user.otpExpires = Date.now() + 300000; 
        await user.save();

        // Gửi mail thực tế
        await transporter.sendMail({
            from: '"SMM Project Support" <no-reply@smm.com>',
            to: email,
            subject: "Mã xác thực khôi phục mật khẩu",
            html: `<h3>Mã OTP của bạn là: <b>${otp}</b></h3><p>Mã này có hiệu lực trong 5 phút.</p>`
        });

        return { errCode: 0, message: 'Mã OTP đã được gửi về email của bạn!' };
    } catch (e) {
        console.log(e);
        return { errCode: -1, message: 'Lỗi server khi gửi mail!' };
    }
}

// 2. Hàm xác thực OTP và đổi mật khẩu mới
let resetPassword = async (data) => {
    try {
        let user = await db.User.findOne({ 
            email: data.email, 
            otpCode: data.otp,
            otpExpires: { $gt: Date.now() } // Kiểm tra mã còn hạn không
        });

        if (!user) return { errCode: 2, message: 'Mã OTP không chính xác hoặc đã hết hạn!' };

        // Hash mật khẩu mới và dọn dẹp OTP
        user.password = await bcrypt.hashSync(data.newPassword, salt);
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        return { errCode: 0, message: 'Khôi phục mật khẩu thành công!' };
    } catch (e) {
        return { errCode: -1, message: 'Lỗi server!' };
    }
}

let handleUpdateProfile = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email) {
                return resolve({ errCode: 1, message: 'Thiếu email người dùng!' });
            }

            let user = await db.User.findOne({ email: data.email });
            if (user) {
                // Chỉ cập nhật những trường được phép sửa
                user.fullName = data.fullName;
                user.address = data.address;
                user.avatar = data.avatar; // Link ảnh 

                await user.save();
                resolve({ errCode: 0, message: 'Cập nhật hồ sơ thành công!' });
            } else {
                resolve({ errCode: 2, message: 'Người dùng không tồn tại!' });
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    sendOTPtoEmail,
    resetPassword,
    handleUpdateProfile
}