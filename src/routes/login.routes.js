import { Router } from "express";

const loginRouter = Router()

loginRouter.get('/',  (req, res) => {
    res.render('login', {
        css: "style.css",
        title: "Login",
        js: "login.js",
    })
})

export default loginRouter