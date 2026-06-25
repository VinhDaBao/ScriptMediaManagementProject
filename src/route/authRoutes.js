import express from 'express';
import * as authController from '../controller/authController.js';
import * as userController from '../controller/userController.js';
import { registerLimiter } from '../middlewares/rateLimit.js';
import { validateRegister } from '../middlewares/validation.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/roleMiddleware.js';
import loginLimiter from '../middlewares/rateLimitMiddleware.js';
import { body } from 'express-validator';
import upload from '../middlewares/upload.js';
import { login, refreshToken, logout } from '../controller/authController.js';
import User from '../models/user.js'; 
import Payment from '../models/payment.js';
import Subscription from '../models/subscription.js';

const router = express.Router();

// Register & Login
router.post('/register', registerLimiter, validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', loginLimiter, body('email').isEmail(), body('password').isLength({ min: 6 }), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);

router.get('/user/profile', authMiddleware, authorizeRole('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ message: 'Welcome user', user: user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy profile' });
    }
});

router.get('/admin/profile', authMiddleware, authorizeRole('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ message: 'Welcome admin', user: user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy profile admin' });
    }
});

// ==========================================
// ĐÃ SỬA: BƠM THÊM DỮ LIỆU GÓI CƯỚC (POPULATE)
// ==========================================
router.get('/all-users', authMiddleware, authorizeRole('admin'), async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        let query = { role: 'user' };

        if (searchQuery) {
            query.$or = [
                { email: { $regex: searchQuery, $options: 'i' } },
                { fullName: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const sortConfig = {
            [sortBy]: sortOrder
        };

        const skip = (page - 1) * limit;

        // 1. Lấy danh sách User (dùng .lean() để biến thành object Javascript thuần)
        const [users, totalUsers] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort(sortConfig)
                .skip(skip)
                .limit(limit)
                .lean(), 
            User.countDocuments(query)
        ]);

        // 2. Lấy ra danh sách các ID của những user vừa tìm được
        const userIds = users.map(user => user._id);

        // 3. Tìm các gói Subscription tương ứng với các user đó (Chỉ lấy gói ACTIVE)
        const subscriptions = await Subscription.find({ 
            userId: { $in: userIds },
            status: 'ACTIVE'
        }).populate({ path: 'planId', select: 'name' }).lean();

        // 4. Ghép thông tin gói vào từng User
        const usersWithPlan = users.map(user => {
            const userSub = subscriptions.find(sub => String(sub.userId) === String(user._id));
            return {
                ...user,
                subscription: userSub || null // Nếu có gói thì nhét vào, không thì null
            };
        });

        res.json({
            errCode: 0,
            data: {
                users: usersWithPlan,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalItems: totalUsers,
                    totalPages: Math.ceil(totalUsers / limit)
                }
            }
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách user:', error);
        res.status(500).json({
            errCode: 1,
            message: 'Lỗi server'
        });
    }
});

router.get('/admin/dashboard-stats', authMiddleware, authorizeRole('admin'), async (req, res) => {
    try {
        // 1. Tổng user (Chỉ đếm role 'user')
        const totalUsers = await User.countDocuments({ role: 'user' });

        // 2. Tổng Pro (Chỉ đếm các subscription đang ACTIVE)
        const proUsers = await Subscription.countDocuments({ status: 'ACTIVE' });

        // 3. Tổng doanh thu (Tính tổng tiền các hóa đơn SUCCESS)
        const payments = await Payment.find({ status: 'SUCCESS' }).lean();
        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // 4. Doanh thu 6 tháng gần nhất
        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = `Tháng ${d.getMonth() + 1}`;
            
            // Tìm các khoản thu trong tháng đó
            const monthPayments = payments.filter(p => {
                const pDate = new Date(p.createdAt);
                return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
            });
            const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            
            revenueData.push({ month: monthStr, revenue: monthRevenue });
        }

        // 5. Tỉ lệ gói (FREE vs PRO)
        const freeUsers = totalUsers - proUsers;
        const planData = [
            { name: 'Gói FREE', value: freeUsers > 0 ? freeUsers : 0 },
            { name: 'Gói PRO', value: proUsers }
        ];

        res.json({
            errCode: 0,
            data: {
                totalUsers,
                activeSubscriptions: proUsers,
                totalRevenue,
                revenueData,
                planData
            }
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê Dashboard:', error);
        res.status(500).json({ errCode: 1, message: 'Lỗi server' });
    }
});

router.get('/billing-info', authMiddleware, userController.default.getBillingInfo);

router.post('/toggle-user-status', authMiddleware, authorizeRole('admin'), userController.default.handleToggleUserStatus);

router.post('/forgot-password', userController.default.handleForgotPassword);
router.post('/verify-forgot-password-otp', userController.default.handleVerifyForgotPasswordOTP);
router.post('/reset-password', userController.default.handleResetPassword);
router.put('/edit-profile', authMiddleware, upload.single('avatar'), userController.default.handleEditProfile);

export default router;