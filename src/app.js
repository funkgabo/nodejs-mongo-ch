import express from 'express'
import multer from 'multer'
import { __dirname } from './path.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import homeRouter from './routes/home.routes.js';
import realTimeProductsRouter from './routes/realTimeProducts.routes.js';
import productRouter from './routes/products.routes.js';
import cartRouter from './routes/carts.routes.js';
import mongoose from 'mongoose';
import userRouter from './routes/users.routes.js';
import chatRouter from './routes/chat.routes.js';
import { productModel } from './models/products.models.js';
import { messageModel } from './models/messages.models.js';
import { userModel } from './models/users.models.js';
import 'dotenv/config'
import sessionRouter from './routes/session.routes.js';
import cookieParser from 'cookie-parser'
import session from 'express-session'
import loginRouter from './routes/login.routes.js';
import MongoStore from 'connect-mongo'
import initializePassport from './config/passport.js'
import passport from 'passport'

const app = express()
const PORT = 4000

//Conexión a Mongoose
mongoose.connect(process.env.MONGO_URL)
    .then(async() => {
        await userModel.create()
        console.log('DB Connected')})
    .catch(() => console.log('Error connecting to DB'))

//Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/img') //null hace referencia a que no envia errores
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`) //Concateno el nombre original de mi archivo con milisegundos con Date.now()
    }
})

const serverExpress = app.listen(PORT, () => {
    console.log(`Server on http://localhost:${PORT}/static/login`)
})

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.SIGNED_COOKIE)) // La cookie esta firmada
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: {
            useNewUrlParser: true, //Establezco que la conexion sea mediante URL
            useUnifiedTopology: true //Manego de clusters de manera dinamica
        },
        ttl: 60 //Duracion de la sesion en la BDD en segundos

    }),
    secret: process.env.SESSION_SECRET,
    resave: false, //Fuerzo a que se intente guardar a pesar de no tener modificacion en los datos
    saveUninitialized: false //Fuerzo a guardar la session a pesar de no tener ningun dato
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', engine()) //Defino que motor de plantillas voy a utilizar y su config
app.set('view engine', 'handlebars') //Setting de mi app de hbs
app.set('views', path.resolve(__dirname, './views')) //Resolver rutas absolutas a traves de rutas relativas
const upload = multer({ storage: storage })
app.use('/static', express.static(path.join(__dirname, '/public'))) //Unir rutas en una sola concatenandolas

//Server Socket.io
const io = new Server(serverExpress)
const prods = []
io.on('connection', (socket) => {
    console.log("Servidor Socket.io conectado")
    socket.on('mensajeConexion', (user) => {
        if (user.rol === "Admin") {
            socket.emit('credencialesConexion', "Usuario valido")
        } else {
            socket.emit('credencialesConexion', "Usuario no valido")
        }
    })

    socket.on('mensaje', async (infoMensaje) => {
        await messageModel.create(infoMensaje)
        const messages = await messageModel.find()
        console.log(messages)
        io.emit('mensajes', messages)
    })

    socket.on('addProduct', async (nuevoProd) => {
        await productModel.create(nuevoProd)
        const allProds = await productModel.find()
        const lastProd = allProds[allProds.length -1]
        socket.emit('products', [lastProd])
    })
    
    socket.on('loadProducts', async() => {
        const prodModel = await productModel.find()
        socket.emit('products', prodModel)
    })
    
    socket.on('deleteProduct', async(id) => {
        console.log(id)
        await productModel.findOneAndDelete(id)
        socket.emit('deleteRow', id)
    })

    socket.on('loadMessages', async () => {
        const messages = await messageModel.find()
        socket.emit('mensajes', messages)
    })

})

//Routes

// app.use('/api/products', prodsRouter)
app.use('/static/home', homeRouter)
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/users', userRouter)
app.use('/static/chat', chatRouter)
app.use('/static/realTimeProducts', realTimeProductsRouter)
app.use('/static/login', loginRouter)
app.use('/static/sessions', sessionRouter)


/*app.get('/static', (req, res) => {
    const user = {
        nombre: "Maria",
        cargo: "Tutor"
    }

    const cursos = [
        { numCurso: 123, dia: "S", horario: "Mañana" },
        { numCurso: 456, dia: "MyJ", horario: "Tarde" },
        { numCurso: 789, dia: "LyM", horario: "Noche" }
    ]
    res.render('home', {
        user: user,
        css: "style.css",
        title: "Home",
        esTutor: user.cargo === "Tutor",
        cursos: cursos
    })
})*/

app.post('/upload', upload.single('product'), (req, res) => {
    console.log(req.file)
    console.log(req.body)
    res.status(200).send("Imagen cargada")
})
