const { body } = require("express-validator");

const loginValidator = [
  body("identity")
    .trim()
    .notEmpty()
    .withMessage("El usuario o correo es obligatorio"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

module.exports = { loginValidator };
