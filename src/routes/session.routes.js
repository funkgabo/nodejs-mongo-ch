import { Router } from "express";
import { userModel } from "../models/users.models.js";

const sessionRouter = Router()

sessionRouter.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    try {
        if (req.session.login) {
            res.status(200).send({ resultado: 'Login ya existente' })
        }
        const user = await userModel.findOne({ email: email })
        if (user) {
            if (user.password == password) {
                req.session.login = true
                req.session.user = { firstName: user.first_name, rol: user.rol }
                res.redirect(301, '/static/home') //Redireccion
            } else {
                res.status(401).send({ resultado: 'Contaseña no valida', message: password })
            }
        } else {
            res.status(404).send({ resultado: 'Not Found', message: user })
        }

    } catch (error) {
        res.status(400).send({ error: `Error en Login: ${error}` })
    }
})

sessionRouter.get('/logout', (req, res) => {
    if (req.session.login || req.session.user) {
        req.session.destroy()
    }
    res.redirect(301, '/static/login')
})


export default sessionRouter