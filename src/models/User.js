// RF-R7 – User con campos de activación y reset

const mongoose = require("mongoose");

const USER_ROLES = ["cliente", "comercio", "delivery", "admin"];

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      trim: true,
      default: "",
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: USER_ROLES,
      default: "cliente",
    },
    activo: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    activationToken: {
      type: String,
      default: null,
    },
    activationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
    favoritos: [
    {
        type: require("mongoose").Schema.Types.ObjectId,
        ref: "Commerce",
    },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = { User, USER_ROLES };
