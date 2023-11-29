import { Router } from "express";
import { userModel } from "../models/users.models.js";
import passport from "passport";
import { cartModel } from "../models/carts.models.js";
import { productModel } from "../models/products.models.js";

const userRouter = Router()

userRouter.get('/', async (req, res) => {
    try {
        const users = await userModel.find()
        res.status(200).send({ respuesta: 'OK', mensaje: users })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consultar usuarios', mensaje: error })
    }
})

userRouter.get('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findById(id)
        if (user) {
            res.status(200).send({ respuesta: 'OK', mensaje: user })
        } else {
            res.status(404).send({ respuesta: 'Error en consultar usuario', mensaje: 'User not Found' })
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consultar usuario', mensaje: error })
    }
})

userRouter.post('/', passport.authenticate('register'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).send({ mensaje: "Usuario ya existente" })
        }

        res.status(200).send({ mensaje: 'Usuario registrado' })
    } catch (error) {
        res.status(500).send({ mensaje: `Error al registrar usuario ${error}` })
    }
    /* const { first_name, last_name, age, email, password } = req.body
    try {
        const respuesta = await userModel.create({ first_name, last_name, age, email, password })
        res.status(200).send({ respuesta: 'OK', mensaje: respuesta })
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en crear usuario', mensaje: error })
    } */
})

userRouter.put('/:id', async (req, res) => {
    const { id } = req.params
    const { first_name, last_name, age, email, password } = req.body
    try {
        const user = await userModel.findByIdAndUpdate(id, { first_name, last_name, age, email, password })
        if (user) {
            res.status(200).send({ respuesta: 'OK', mensaje: user })
        } else {
            res.status(404).send({ respuesta: 'Error en actualizar usuario', mensaje: 'User not Found' })
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en actualizar usuario', mensaje: error })
    }
})

userRouter.delete('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findByIdAndDelete(id)
        if (user) {
            res.status(200).send({ respuesta: 'OK', mensaje: user })
        } else {
            res.status(404).send({ respuesta: 'Error en eliminar usuario', mensaje: 'User not Found' })
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en eliminar usuario', mensaje: error })
    }
})

userRouter.post('/:uid', async (req, res) => {
    const { uid } = req.params
    const user = await userModel.findById(uid)
    if (!user.cart) {
        const cart = await cartModel.create({})
        user.cart = await cartModel.findById(cart._id)
    }
    user.save()
    res.send('User Cart Created')
})

userRouter.post('/:pid/:uid', async (req, res) => {
    const { pid, uid } = req.params
    const product = await productModel.findById(pid)
    const user = await userModel.findById(uid)
    user.cart = { ...user.cart, product}
    user.save()
    res.send('Product Added to Cart')
})

export default userRouter
