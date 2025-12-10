const { body } = require("express-validator");

const productValidator = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio."),
  body("descripcion")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("La descripción no puede superar 500 caracteres."),
  body("precio")
    .notEmpty()
    .withMessage("El precio es obligatorio.")
    .bail()
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser un número mayor a cero."),
  body("categoriaId")
    .trim()
    .notEmpty()
    .withMessage("Debes seleccionar una categoría."),
  body("imagen")
    .optional({ checkFalsy: true })
    .trim(),
];

module.exports = { productValidator };
