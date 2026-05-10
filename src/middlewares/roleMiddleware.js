const authorizeRole = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.user.role)) {
            return res.status(403).json({
                message: 'Forbidden'
            })
        }

        next()
    }
}

export default authorizeRole