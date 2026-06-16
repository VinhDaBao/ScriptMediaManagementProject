import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, 
    message: { 
        message: "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút!" 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default loginLimiter;