// RF-R7 – Validadores de login, registros y reset password

const { body } = require("express-validator");
const { User } = require("../models/User");

const loginValidator = [
  body("identity")
    .trim()
    .notEmpty()
    .withMessage("El usuario o correo es obligatorio"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

const registerClientDeliveryValidator = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("apellido").trim().notEmpty().withMessage("El apellido es obligatorio"),
  body("telefono").trim().notEmpty().withMessage("El teléfono es obligatorio"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio")
    .bail()
    .isEmail()
    .withMessage("El correo no es válido")
    .bail()
    .custom(async (value) => {
      const existing = await User.findOne({ email: value.toLowerCase() });
      if (existing) {
        throw new Error("El correo ya está registrado");
      }
      return true;
    }),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .bail()
    .custom(async (value) => {
      const existing = await User.findOne({ username: value.toLowerCase() });
      if (existing) {
        throw new Error("El nombre de usuario ya está en uso");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("passwordConfirmation")
    .notEmpty()
    .withMessage("La confirmación de contraseña es obligatoria")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }
      return true;
    }),
];

const registerCommerceValidator = [
  body("nombreComercio")
    .trim()
    .notEmpty()
    .withMessage("El nombre del comercio es obligatorio"),
  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio")
    .bail()
    .isEmail()
    .withMessage("El correo no es válido")
    .bail()
    .custom(async (value) => {
      const existing = await User.findOne({ email: value.toLowerCase() });
      if (existing) {
        throw new Error("El correo ya está registrado");
      }
      return true;
    }),
  body("tipoComercioId")
    .trim()
    .notEmpty()
    .withMessage("El tipo de comercio es obligatorio"),
  body("horarioApertura")
    .trim()
    .notEmpty()
    .withMessage("El horario de apertura es obligatorio"),
  body("horarioCierre")
    .trim()
    .notEmpty()
    .withMessage("El horario de cierre es obligatorio"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El usuario es obligatorio")
    .bail()
    .custom(async (value) => {
      const existing = await User.findOne({ username: value.toLowerCase() });
      if (existing) {
        throw new Error("El usuario ya está en uso");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("passwordConfirmation")
    .notEmpty()
    .withMessage("La confirmación de contraseña es obligatoria")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }
      return true;
    }),
];

const forgotPasswordValidator = [
  body("identity")
    .trim()
    .notEmpty()
    .withMessage("Debes ingresar tu usuario o correo"),
];

const resetPasswordValidator = [
  body("password")
    .notEmpty()
    .withMessage("La nueva contraseña es obligatoria")
    .bail()
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
  body("passwordConfirmation")
    .notEmpty()
    .withMessage("La confirmación es obligatoria")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }
      return true;
    }),
];

module.exports = {
  loginValidator,
  registerClientDeliveryValidator,
  registerCommerceValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};
