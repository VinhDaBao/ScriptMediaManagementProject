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

router.get('/user/profile', authMiddleware, authorizeRole('user'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ message: 'Welcome user', user: user });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching the profile.' });
    }
});

router.get('/admin/profile', authMiddleware, authorizeRole('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ message: 'Welcome admin', user: user });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching the admin profile.' });
    }
});

router.get('/all-users', authMiddleware, authorizeRole('admin'), userController.default.handleGetAllUsers);

router.get('/admin/dashboard-stats', authMiddleware, authorizeRole('admin'), userController.default.handleGetDashboardStats);
router.get('/billing-info', authMiddleware, userController.default.getBillingInfo);

router.post('/toggle-user-status', authMiddleware, authorizeRole('admin'), userController.default.handleToggleUserStatus);

router.post('/forgot-password', userController.default.handleForgotPassword);
router.post('/verify-forgot-password-otp', userController.default.handleVerifyForgotPasswordOTP);
router.post('/reset-password', userController.default.handleResetPassword);
router.put('/edit-profile', authMiddleware, upload.single('avatar'), userController.default.handleEditProfile);

export default router;