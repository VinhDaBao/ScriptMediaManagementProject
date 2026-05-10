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

export default router