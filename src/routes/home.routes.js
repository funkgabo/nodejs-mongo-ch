import { Router } from "express";

const homeRouter = Router()
homeRouter.get('/', (req, res) => {
    console.log(req.session.user)
    res.render('home', {
        css: "style.css",
        title: "Home",
        js: "home.js",
        name: req.session.user.first_name,
        rol: req.session.user.rol
    })
})

export default homeRouter