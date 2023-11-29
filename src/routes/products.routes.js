import { Router } from "express";
import { productModel } from "../models/products.models.js";
import { passportError, authorization } from "../utils/messagesError.js";
import { isAdmin } from "../middlewares/global.middlewares.js";

const productRouter = Router()

productRouter.get('/', async (req, res) => {
    let { limit } = req.query
    let { page } = req.query
    let { sort } = req.query
    let { category } = req.query
    limit = limit ?? 10
    page = page ?? 1
    try {
        const prods = await productModel.paginate(category ? { category: category } : {}, { limit: limit, page: page, sort: { price: sort } })
        res.status(200).send({ respuesta: 'OK', mensaje: prods })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consultar productos', mensaje: error })
    }
})

productRouter.get('/:id', async (req, res) => {
    const { id } = req.params

    try {
        const prod = await productModel.findById(id)
        if (prod)
            res.status(200).send({ respuesta: 'OK', mensaje: prod })
        else
            res.status(404).send({ respuesta: 'Error en consultar Producto', mensaje: 'Not Found' })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consulta producto', mensaje: error })
    }
})

productRouter.post('/', passportError('jwt'), isAdmin, async (req, res) => {
    try {
        const { title, description, stock, code, price, category } = req.body
        const prod = await productModel.create({ title, description, stock, code, price, category })
        res.status(200).send({ respuesta: 'OK', mensaje: prod })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en crear productos', mensaje: error })
    }
})

productRouter.put('/:id', passportError('jwt'), isAdmin, async (req, res) => {
    const { id } = req.params
    const { title, description, stock, status, code, price, category } = req.body
    try {
        const prod = await productModel.findByIdAndUpdate(id, { title, description, stock, status, code, price, category })
        if (prod)
            res.status(200).send({ respuesta: 'OK', mensaje: 'Producto actualizado' })
        else
            res.status(404).send({ respuesta: 'Error en actualizar Producto', mensaje: 'Not Found' })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en actualizar producto', mensaje: error })
    }
})

productRouter.delete('/:id', passportError('jwt'), isAdmin, async (req, res) => {
    const { id } = req.params

    try {
        const prod = await productModel.findByIdAndDelete(id)
        if (prod)
            res.status(200).send({ respuesta: 'OK', mensaje: 'Producto eliminado' })
        else
            res.status(404).send({ respuesta: 'Error en eliminar Producto', mensaje: 'Not Found' })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en eliminar producto', mensaje: error })
    }
})


export default productRouter
