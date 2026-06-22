import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 5, 
    message: { 
        message: "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút!" 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default loginLimiter;