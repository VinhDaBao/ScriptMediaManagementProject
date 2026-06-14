import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization

        if (!authHeader) {

            return res.status(401).json({
                message: 'No token'
            })
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded
        console.log('Decoded user:', req.user)

        next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'jwt expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export default authMiddleware