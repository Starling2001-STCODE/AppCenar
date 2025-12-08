const mongoose = require("mongoose");

const commerceSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: null,
    },
    horarioApertura: {
      type: String,
      required: true,
      trim: true,
    },
    horarioCierre: {
      type: String,
      required: true,
      trim: true,
    },
    tipoComercio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommerceType",
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Commerce = mongoose.model("Commerce", commerceSchema);

module.exports = { Commerce };
