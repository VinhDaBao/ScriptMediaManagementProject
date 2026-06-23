import User from '../models/User.js'; // Nhớ thêm đuôi .js nếu Node.js yêu cầu
import bcrypt from 'bcryptjs';
import transporter from '../config/mailer.js';
import fs from 'fs';
import path from 'path';

const salt = bcrypt.genSaltSync(10);

const sendOTPtoEmail = async (email) => {
    try {
        let user = await User.findOne({ email: email });
        if (!user) return { errCode: 1, message: 'Email không tồn tại!' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.otpCode = otp;
        user.otpExpires = Date.now() + 300000; 
        await user.save();

        await transporter.sendMail({
            from: '"SMM Project Support" <no-reply@smm.com>',
            to: email,
            subject: "Mã xác thực khôi phục mật khẩu",
            html: `<h3>Mã OTP của bạn là: <b>${otp}</b></h3><p>Mã này có hiệu lực trong 5 phút.</p>`
        });

        return { errCode: 0, message: 'Mã OTP đã được gửi!' };
    } catch (e) {
        console.log(e);
        return { errCode: -1, message: 'Lỗi server gửi mail!' };
    }
}

const resetPassword = async (data) => {

    try {

        let user = await User.findOne({
            email: data.email
        });

        if (!user) {

            return {
                errCode: 1,
                message: 'Email không tồn tại!'
            };
        }

        user.password =
            await bcrypt.hashSync(
                data.newPassword,
                salt
            );
        user.otpCode = null;
        user.otpExpires = null;

        await user.save();

        return {
            errCode: 0,
            message: 'Đổi mật khẩu thành công!'
        };

    } catch (e) {

        return {
            errCode: -1,
            message: 'Lỗi server!'
        };
    }
}

const handleUpdateProfile = (currentUser, data) => {
    return new Promise(async (resolve, reject) => {

        try {

            let user = await User.findById(currentUser.id);

            if (!user) {
                return resolve({
                    errCode: 1,
                    message: 'Không tìm thấy user!'
                });
            }

            if (data.fullName) {
                user.fullName = data.fullName;
            }

            if (data.avatar) {

                if (user.avatar) {

                    const oldImagePath = path.join(
                        process.cwd(),
                        'src/public',
                        user.avatar
                    );

                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                user.avatar = data.avatar;
            }

            await user.save();

            resolve({
                errCode: 0,
                message: 'Cập nhật thành công!',
                user: user
            });

        } catch (e) {

            reject(e);
        }
    });
};

const verifyForgotPasswordOTP = async (data) => {
    try {

        let user = await User.findOne({
            email: data.email,
            otpCode: data.otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return {
                errCode: 1,
                message: 'OTP sai hoặc hết hạn!'
            };
        }

        return {
            errCode: 0,
            message: 'OTP hợp lệ!'
        };

    } catch (e) {

        return {
            errCode: -1,
            message: 'Lỗi server!'
        };
    }
}

export default {
    sendOTPtoEmail,
    verifyForgotPasswordOTP,
    resetPassword,
    handleUpdateProfile
};