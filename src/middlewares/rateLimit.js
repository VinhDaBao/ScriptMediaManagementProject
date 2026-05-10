import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút [cite: 1239]
    max: 5, // Tối đa 5 lần [cite: 1240]
    message: {
        message: "Bạn đã thử đăng ký quá nhiều lần, vui lòng quay lại sau 15 phút."
    },
    standardHeaders: true,
    legacyHeaders: false,
});