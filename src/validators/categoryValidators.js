const { body } = require("express-validator");

const createCategoryValidator = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio."),
  body("descripcion")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("La descripción no puede superar 255 caracteres."),
];

module.exports = { createCategoryValidator };
