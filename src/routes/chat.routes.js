import { Router } from "express";

const chatRouter = Router()

chatRouter.get('/',  (req, res) => {
    res.render('chat', {
        css: "style.css",
        title: "Chat",
        js: "script.js",
    })
})

export default chatRouter