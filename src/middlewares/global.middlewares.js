export const isAdmin = (req, res, next) => {
    if (req.user.user.rol === 'admin') {
        next();
    } else {
        res.status(401).send({ error: 'Not Admin' })
    }
}