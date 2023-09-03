import express from 'express'
import multer from 'multer'
import prodsRouter from "./routes/products.routes.js";
import { __dirname } from './path.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path, { resolve } from 'path';
import homeRouter from './routes/home.routes.js';
import ProductManager from '../classes/ProductManager.js';
import realTimeProductsRouter from './routes/realTimeProducts.routes.js';
import productRouter from './routes/products.routes.js';
import cartRouter from './routes/carts.routes.js';

const app = express()
const PORT = 4000

//Conexión a Mongoose
mongoose.connect('mongodb+srv://<user>:<password>@litswm.b362gwa.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('DB Connected'))
    .catch(() => console.log('Error to connect to DB'))

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
    console.log(`Server on http://localhost:${PORT}/static/home`)
})

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', engine()) //Defino que motor de plantillas voy a utilizar y su config
app.set('view engine', 'handlebars') //Setting de mi app de hbs
app.set('views', path.resolve(__dirname, './views')) //Resolver rutas absolutas a traves de rutas relativas
const upload = multer({ storage: storage })
app.use('/static', express.static(path.join(__dirname, '/public'))) //Unir rutas en una sola concatenandolas

//Server Socket.io
const io = new Server(serverExpress)
const mensajes = []
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

    socket.on('mensaje', (infoMensaje) => {
        console.log(infoMensaje)
        mensajes.push(infoMensaje)
        socket.emit('mensajes', mensajes)
    })

    socket.on('addProduct', async (nuevoProd) => {
        const manager = new ProductManager()
        await manager.addProduct(JSON.stringify(nuevoProd))
        const products = await manager.getProducts()
        const lastProd = products[products.length -1]
        socket.emit('products', [lastProd])
    })
    
    socket.on('loadProducts', async() => {
        const manager = new ProductManager()
        const products = await manager.getProducts()
        socket.emit('products', products)
    })
    
    socket.on('deleteProduct', async(id) => {
        const manager = new ProductManager()
        await manager.deleteProductById(id)
        socket.emit('deleteRow', id)
    })
})

//Routes

app.use('/api/products', prodsRouter)
app.use('/static/home', homeRouter)
app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/static/realTimeProducts', realTimeProductsRouter)


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

