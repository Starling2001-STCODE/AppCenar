const { body } = require("express-validator");

const commerceTypeValidator = [
    body("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ max: 100 })
        .withMessage("El nombre es muy largo"),

    body("descripcion")
        .optional()
        .isLength({ max: 300 })
        .withMessage("La descripción es muy larga"),
];

module.exports = { commerceTypeValidator };
