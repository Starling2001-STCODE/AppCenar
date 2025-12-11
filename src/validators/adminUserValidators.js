const { body } = require("express-validator");

const createAdminValidator = [
    body("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ max: 100 })
        .withMessage("El nombre es muy largo"),
    body("apellido")
        .notEmpty()
        .withMessage("El apellido es obligatorio")
        .isLength({ max: 100 })
        .withMessage("El apellido es muy largo"),
    body("telefono")
        .notEmpty()
        .withMessage("El teléfono es obligatorio")
        .isLength({ max: 30 })
        .withMessage("El teléfono es muy largo"),
    body("email")
        .notEmpty()
        .withMessage("El correo es obligatorio")
        .bail()
        .isEmail()
        .withMessage("El correo no es válido")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("La contraseña es obligatoria")
        .bail()
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

const updateAdminValidator = [
    body("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ max: 100 })
        .withMessage("El nombre es muy largo"),
    body("apellido")
        .notEmpty()
        .withMessage("El apellido es obligatorio")
        .isLength({ max: 100 })
        .withMessage("El apellido es muy largo"),
    body("telefono")
        .notEmpty()
        .withMessage("El teléfono es obligatorio")
        .isLength({ max: 30 })
        .withMessage("El teléfono es muy largo"),
    body("email")
        .notEmpty()
        .withMessage("El correo es obligatorio")
        .bail()
        .isEmail()
        .withMessage("El correo no es válido")
        .normalizeEmail(),
    body("password")
        .optional({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

module.exports = { createAdminValidator, updateAdminValidator };
