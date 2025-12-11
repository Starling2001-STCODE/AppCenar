const { body } = require("express-validator");

const itbisValidator = [
    body("itbis")
        .notEmpty()
        .withMessage("El ITBIS es obligatorio")
        .bail()
        .isFloat({ min: 0, max: 100 })
        .withMessage("El ITBIS debe ser un número entre 0 y 100"),
];

module.exports = { itbisValidator };
