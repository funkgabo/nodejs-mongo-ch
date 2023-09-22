import { Router } from "express";

const homeRouter = Router()

homeRouter.get('/',  (req, res) => {
    console.log(req.body)
    res.render('home', {
        css: "style.css",
        title: "Home",
        js: "home.js",
    })
})

export default homeRouter