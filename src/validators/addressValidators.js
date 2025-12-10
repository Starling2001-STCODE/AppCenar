const { body } = require("express-validator");

const addressValidator = [
    body("linea1")
        .trim()
        .notEmpty()
        .withMessage("La dirección es obligatoria."),
    body("alias")
        .optional()
        .trim(),
    body("referencia")
        .optional()
        .trim(),
];

module.exports = { addressValidator };
