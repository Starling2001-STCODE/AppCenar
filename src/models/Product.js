const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true, trim: true },
    comercio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commerce",
      required: true,
    },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
