import express from 'express'

import { registerLimiter } from '../middlewares/rateLimit.js'

import { validateRegister } from '../middlewares/validation.js'

import * as authController from '../controller/authController.js'

import userController from '../controller/userController.js'

const router = express.Router()

// Register
router.post(
    '/register',
    registerLimiter,
    validateRegister,
    authController.register
)

// Verify OTP
router.post(
    '/verify-otp',
    authController.verifyOTP
)

// Forgot password
router.post(
    '/forgot-password',
    userController.handleForgotPassword
)

// Reset password
router.post(
    '/reset-password',
    userController.handleResetPassword
)

// Edit profile
router.put(
    '/edit-profile',
    userController.handleEditProfile
)
import { body } from 'express-validator'

import { login } from '../controller/authController.js'

import authMiddleware from '../middlewares/authMiddleware.js'

import authorizeRole from '../middlewares/roleMiddleware.js'

import loginLimiter from '../middlewares/rateLimitMiddleware.js'


router.post(
    '/login',

    loginLimiter,

    body('email').isEmail(),

    body('password').isLength({ min: 6 }),

    login
)

router.get(
    '/user/profile',

    authMiddleware,

    authorizeRole('user'),

    (req, res) => {

        res.json({
            message: 'Welcome user',
            user: req.user
        })
    }
)

router.get(
    '/admin/profile',

    authMiddleware,

    authorizeRole('admin'),

    (req, res) => {

        res.json({
            message: 'Welcome admin',
            user: req.user
        })
    }
)

export default router