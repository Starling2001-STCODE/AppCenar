const { body } = require("express-validator");

const updateProfileValidator = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio."),
    body("apellido")
        .trim()
        .notEmpty()
        .withMessage("El apellido es obligatorio."),
    body("telefono")
        .trim()
        .notEmpty()
        .withMessage("El teléfono es obligatorio.")
        .isLength({ min: 8 })
        .withMessage("El teléfono debe tener al menos 8 dígitos."),
];

module.exports = { updateProfileValidator };
