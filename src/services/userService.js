import User from '../models/User.js'; // Nhớ thêm đuôi .js nếu Node.js yêu cầu
import bcrypt from 'bcryptjs';
import transporter from '../config/mailer.js';
import fs from 'fs';
import path from 'path';
import Subscription from '../models/subscription.js';
import Payment from '../models/payment.js';

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

const getAllUsersAdmin = async (queryParams) => {
    const { search, page, limit, sortBy, sortOrder } = queryParams;
    let query = { role: 'user' };

    if (search) {
        query.$or = [
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } }
        ];
    }

    const sortConfig = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find(query).select('-password').sort(sortConfig).skip(skip).limit(limit).lean(),
        User.countDocuments(query)
    ]);

    const userIds = users.map(user => user._id);
    const subscriptions = await Subscription.find({
        userId: { $in: userIds },
        status: 'ACTIVE'
    }).populate({ path: 'planId', select: 'name' }).lean();

    const usersWithPlan = users.map(user => {
        const userSub = subscriptions.find(sub => String(sub.userId) === String(user._id));
        return { ...user, subscription: userSub || null };
    });

    return {
        users: usersWithPlan,
        pagination: {
            currentPage: page,
            pageSize: limit,
            totalItems: totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
        }
    };
};

// ==========================================
// THÊM: LOGIC LẤY THỐNG KÊ DASHBOARD (ADMIN)
// ==========================================
const getAdminDashboardStats = async () => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const proUsers = await Subscription.countDocuments({ status: 'ACTIVE' });

    const payments = await Payment.find({ status: 'SUCCESS' }).lean();
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = `Tháng ${d.getMonth() + 1}`;

        const monthPayments = payments.filter(p => {
            const pDate = new Date(p.createdAt);
            return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
        });
        const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        revenueData.push({ month: monthStr, revenue: monthRevenue });
    }

    const freeUsers = totalUsers - proUsers;
    const planData = [
        { name: 'Gói FREE', value: freeUsers > 0 ? freeUsers : 0 },
        { name: 'Gói PRO', value: proUsers }
    ];

    return {
        totalUsers,
        activeSubscriptions: proUsers,
        totalRevenue,
        revenueData,
        planData
    };
};

export default {
    sendOTPtoEmail,
    verifyForgotPasswordOTP,
    resetPassword,
    handleUpdateProfile,
    getAllUsersAdmin,
    getAdminDashboardStats
};