import { Schema, model } from "mongoose";

const ticketsSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    purchease_datetime: {
        type: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purcheaser: {
        type: String,
        required: true
    },
})

export const messageModel = model('tickets', ticketsSchema)