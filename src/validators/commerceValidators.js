const { body } = require("express-validator");

const commerceProfileValidator = [
  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio.")
    .bail()
    .isEmail()
    .withMessage("Debes ingresar un correo válido."),
  body("horarioApertura")
    .trim()
    .notEmpty()
    .withMessage("El horario de apertura es obligatorio."),
  body("horarioCierre")
    .trim()
    .notEmpty()
    .withMessage("El horario de cierre es obligatorio."),
];

module.exports = { commerceProfileValidator };
