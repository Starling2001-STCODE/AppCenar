const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        precio: {
            type: Number,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comercio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commerce",
            required: true,
        },
        direccion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length > 0;
                },
            },
        },
        subtotal: {
            type: Number,
            required: true,
        },
        itbis: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        estado: {
            type: String,
            enum: ["pendiente", "confirmado", "preparando", "en_camino", "entregado", "cancelado"],
            default: "pendiente",
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
