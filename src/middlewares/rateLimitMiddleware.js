import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({

    windowMs: 60 * 1000,

    max: 5,

    message: {
        message: 'Too many login attempts'
    }
})

export default loginLimiter