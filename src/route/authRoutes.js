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

const router = express.Router();

// Register & Login
router.post('/register', registerLimiter, validateRegister, authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', loginLimiter, body('email').isEmail(), body('password').isLength({ min: 6 }), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);
// ==========================================
// ĐÃ SỬA: LẤY DỮ LIỆU TỪ DATABASE THAY VÌ TOKEN CŨ
// ==========================================
router.get('/user/profile', authMiddleware, authorizeRole('user'), async (req, res) => {
    try {
        // Dùng id từ token để tìm user trong MongoDB, loại bỏ field password cho an toàn
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

        const [users, totalUsers] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort(sortConfig)
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        res.json({
            errCode: 0,
            data: {
                users,
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

router.post('/toggle-user-status', authMiddleware, authorizeRole('admin'), userController.default.handleToggleUserStatus);

router.post('/forgot-password', userController.default.handleForgotPassword);
router.post('/verify-forgot-password-otp', userController.default.handleVerifyForgotPasswordOTP);
router.post('/reset-password', userController.default.handleResetPassword);
router.put('/edit-profile', authMiddleware, upload.single('avatar'), userController.default.handleEditProfile);

export default router;