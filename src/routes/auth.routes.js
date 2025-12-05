const express = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { loginValidator } = require("../validators/authValidators");
const { User } = require("../models/User");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Iniciar sesión - AppCenar",
    errors: {},
    old: {},
    authError: null,
  });
});

router.post("/login", loginValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      title: "Iniciar sesión - AppCenar",
      errors: errors.mapped(),
      old: {
        identity: req.body.identity,
      },
      authError: null,
    });
  }

  const identity = req.body.identity.trim().toLowerCase();
  const password = req.body.password;

  const user = await User.findOne({
    $or: [{ username: identity }, { email: identity }],
  });

  if (!user) {
    return res.status(401).render("auth/login", {
      title: "Iniciar sesión - AppCenar",
      errors: {},
      old: {
        identity: req.body.identity,
      },
      authError: "Usuario o contraseña incorrectos",
    });
  }

  if (!user.activo) {
    return res.status(403).render("auth/login", {
      title: "Iniciar sesión - AppCenar",
      errors: {},
      old: {
        identity: req.body.identity,
      },
      authError: "Tu cuenta está inactiva. Revisa tu correo o contacta soporte.",
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).render("auth/login", {
      title: "Iniciar sesión - AppCenar",
      errors: {},
      old: {
        identity: req.body.identity,
      },
      authError: "Usuario o contraseña incorrectos",
    });
  }

  req.session.user = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    rol: user.rol,
    nombre: user.nombre,
    activo: user.activo,
  };

  let redirectTo = "/";

  if (user.rol === "cliente") {
    redirectTo = "/cliente/home";
  } else if (user.rol === "comercio") {
    redirectTo = "/comercio/home";
  } else if (user.rol === "delivery") {
    redirectTo = "/delivery/home";
  } else if (user.rol === "admin") {
    redirectTo = "/admin/dashboard";
  }

  res.redirect(redirectTo);
});

module.exports = router;
