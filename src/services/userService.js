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
        if (!user) return { errCode: 1, message: 'Email does not exist.' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.otpCode = otp;
        user.otpExpires = Date.now() + 300000; 
        await user.save();

        await transporter.sendMail({
            from: '"SMM Project Support" <no-reply@smm.com>',
            to: email,
            subject: "Password Reset Verification Code",
            html: `<h3>Your OTP code is: <b>${otp}</b></h3><p>This code is valid for 5 minutes.</p>`
        });

        return { errCode: 0, message: 'OTP has been sent.' };
    } catch (e) {
        console.log(e);
        return { errCode: -1, message: 'Server error while sending email.' };
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
                message: 'Email does not exist.'
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
            message: 'Password changed successfully.'
        };

    } catch (e) {

        return {
            errCode: -1,
            message: 'Server error.'
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
                    message: 'User not found.'
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
                message: 'Profile updated successfully.',
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
                message: 'The OTP is invalid or has expired.'
            };
        }

        return {
            errCode: 0,
            message: 'OTP is valid.'
        };

    } catch (e) {

        return {
            errCode: -1,
            message: 'Server error.'
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
        const monthStr = `Month ${d.getMonth() + 1}`;

        const monthPayments = payments.filter(p => {
            const pDate = new Date(p.createdAt);
            return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
        });
        const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        revenueData.push({ month: monthStr, revenue: monthRevenue });
    }

    const freeUsers = totalUsers - proUsers;
    const planData = [
        { name: 'Free Plan', value: freeUsers > 0 ? freeUsers : 0 },
        { name: 'Pro Plan', value: proUsers }
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