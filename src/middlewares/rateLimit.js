import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút [cite: 1239]
    max: 5, // Tối đa 5 lần [cite: 1240]
    message: {
        message: "You have attempted registration too many times. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});