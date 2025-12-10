const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        alias: {
            type: String,
            trim: true,
        },
        linea1: {
            type: String,
            required: true,
            trim: true,
        },
        referencia: {
            type: String,
            trim: true,
        },
        activo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = { Address };
