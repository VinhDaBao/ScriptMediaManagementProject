import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 5, 
    message: { 
        message: "You have entered incorrect credentials too many times. Please try again in 1 minute." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default loginLimiter;