const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { User } = require("../models/User");
const { Commerce } = require("../models/Commerce");
const { CommerceType } = require("../models/CommerceType");
const { sendActivationEmail, sendResetPasswordEmail } = require("../config/mailer");

function getRedirectPathByRole(rol) {
  if (rol === "cliente") return "/cliente/home";
  if (rol === "comercio") return "/comercio/home";
  if (rol === "delivery") return "/delivery/home";
  if (rol === "admin") return "/admin/dashboard";
  return "/";
}

function buildClientDeliveryTemplateData(req, rol) {
  return {
    title: rol === "cliente" ? "Registro Cliente - AppCenar" : "Registro Delivery - AppCenar",
    roleLabel: rol === "cliente" ? "Cliente" : "Delivery",
    formAction: rol === "cliente" ? "/register/cliente" : "/register/delivery",
    authError: null,
    errors: {},
    old: {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      telefono: req.body.telefono,
      email: req.body.email,
      username: req.body.username,
    },
  };
}

async function buildCommerceTemplateData(req) {
  const tipos = await CommerceType.find({ activo: true }).sort({ nombre: 1 });

  return {
    title: "Registro Comercio - AppCenar",
    authError: null,
    errors: {},
    old: {
      nombreComercio: req.body.nombreComercio,
      telefono: req.body.telefono,
      email: req.body.email,
      horarioApertura: req.body.horarioApertura,
      horarioCierre: req.body.horarioCierre,
      tipoComercioId: req.body.tipoComercioId,
      username: req.body.username,
    },
    tiposComercio: tipos,
  };
}

const authController = {

  getLogin(req, res) {
    if (req.session && req.session.user && req.session.user.activo) {
      const redirectTo = getRedirectPathByRole(req.session.user.rol);
      return res.redirect(redirectTo);
    }

    res.render("auth/login", {
      title: "Iniciar sesión - AppCenar",
      errors: {},
      old: {},
      authError: null,
    });
  },

  async postLogin(req, res) {
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

    const redirectTo = getRedirectPathByRole(user.rol);
    res.redirect(redirectTo);
  },

  getRegisterCliente(req, res) {
    res.render("auth/register_cliente_delivery", {
      title: "Registro Cliente - AppCenar",
      roleLabel: "Cliente",
      formAction: "/register/cliente",
      errors: {},
      old: {},
      authError: null,
    });
  },

  getRegisterDelivery(req, res) {
    res.render("auth/register_cliente_delivery", {
      title: "Registro Delivery - AppCenar",
      roleLabel: "Delivery",
      formAction: "/register/delivery",
      errors: {},
      old: {},
      authError: null,
    });
  },

  async postRegisterCliente(req, res) {
    await handleClientDeliveryRegister(req, res, "cliente");
  },

  async postRegisterDelivery(req, res) {
    await handleClientDeliveryRegister(req, res, "delivery");
  },

 async getRegisterComercio(req, res) {
  const tipos = await CommerceType.find({ activo: true })
    .sort({ nombre: 1 })
    .lean();

  console.log("Tipos de comercio para el formulario:", tipos);

  res.render("auth/register_comercio", {
    title: "Registro Comercio - AppCenar",
    errors: {},
    old: {},
    authError: null,
    tiposComercio: tipos,
  });
},

  async postRegisterComercio(req, res) {
    await handleCommerceRegister(req, res);
  },

  async getActivate(req, res) {
    const token = req.params.token;

    const user = await User.findOne({ activationToken: token });

    if (!user) {
      return res.status(400).render("auth/activation_error", {
        title: "Activación de cuenta - AppCenar",
        message: "El enlace de activación no es válido o ya fue utilizado.",
      });
    }

    const now = new Date();

    if (!user.activationTokenExpiresAt || user.activationTokenExpiresAt < now) {
      user.activationToken = null;
      user.activationTokenExpiresAt = null;
      await user.save();

      return res.status(400).render("auth/activation_error", {
        title: "Activación de cuenta - AppCenar",
        message:
          "El enlace de activación ha expirado. Solicita un nuevo enlace desde la pantalla de inicio de sesión.",
      });
    }

    user.activo = true;
    user.activationToken = null;
    user.activationTokenExpiresAt = null;
    await user.save();

    return res.render("auth/activation_success", {
      title: "Cuenta activada - AppCenar",
      email: user.email,
    });
  },
    getForgotPassword(req, res) {
    res.render("auth/forgot_password", {
      title: "Restablecer contraseña - AppCenar",
      errors: {},
      old: {},
      successMessage: null,
    });
  },

  async postForgotPassword(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/forgot_password", {
        title: "Restablecer contraseña - AppCenar",
        errors: errors.mapped(),
        old: {
          identity: req.body.identity,
        },
        successMessage: null,
      });
    }

    const identity = req.body.identity.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: identity }, { email: identity }],
    });

    if (!user) {
      return res.render("auth/forgot_password", {
        title: "Restablecer contraseña - AppCenar",
        errors: {},
        old: {
          identity: req.body.identity,
        },
        successMessage:
          "Si existe una cuenta asociada, hemos enviado un enlace para restablecer la contraseña.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expires;
    await user.save();

    try {
      await sendResetPasswordEmail(user, token);
    } catch (err) {
      console.error("Error enviando correo de reset:", err.message);
    }

    return res.render("auth/forgot_password", {
      title: "Restablecer contraseña - AppCenar",
      errors: {},
      old: {
        identity: req.body.identity,
      },
      successMessage:
        "Si existe una cuenta asociada, hemos enviado un enlace para restablecer la contraseña.",
    });
  },

  async getResetPassword(req, res) {
    const token = req.params.token;

    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).render("auth/activation_error", {
        title: "Restablecer contraseña - AppCenar",
        message: "El enlace para restablecer la contraseña no es válido o ya fue utilizado.",
      });
    }

    const now = new Date();

    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < now) {
      user.resetPasswordToken = null;
      user.resetPasswordExpiresAt = null;
      await user.save();

      return res.status(400).render("auth/activation_error", {
        title: "Restablecer contraseña - AppCenar",
        message:
          "El enlace para restablecer la contraseña ha expirado. Solicita uno nuevo desde la pantalla de restablecimiento.",
      });
    }

    return res.render("auth/reset_password", {
      title: "Nueva contraseña - AppCenar",
      errors: {},
      token,
    });
  },

  async postResetPassword(req, res) {
    const token = req.params.token;
    const errors = validationResult(req);

    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).render("auth/activation_error", {
        title: "Restablecer contraseña - AppCenar",
        message: "El enlace para restablecer la contraseña no es válido o ya fue utilizado.",
      });
    }

    const now = new Date();

    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < now) {
      user.resetPasswordToken = null;
      user.resetPasswordExpiresAt = null;
      await user.save();

      return res.status(400).render("auth/activation_error", {
        title: "Restablecer contraseña - AppCenar",
        message:
          "El enlace para restablecer la contraseña ha expirado. Solicita uno nuevo desde la pantalla de restablecimiento.",
      });
    }

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/reset_password", {
        title: "Nueva contraseña - AppCenar",
        errors: errors.mapped(),
        token,
      });
    }

    const plainPassword = req.body.password;
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.render("auth/login", {
      title: "Iniciar sesión - AppCenar",
      errors: {},
      old: {
        identity: user.email,
      },
      authError: "Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.",
    });
  },

};

async function handleClientDeliveryRegister(req, res, rol) {
  const errors = validationResult(req);
  const templateDataBase = buildClientDeliveryTemplateData(req, rol);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register_cliente_delivery", {
      ...templateDataBase,
      errors: errors.mapped(),
    });
  }

  const plainPassword = req.body.password;
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let avatarPath = null;
  if (req.file) {
    const relativePath = req.file.path.split("uploads")[1];
    avatarPath = "/uploads" + relativePath.replace(/\\/g, "/");
  }

  const user = await User.create({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
    passwordHash,
    rol,
    activo: false,
    avatar: avatarPath,
    activationToken: token,
    activationTokenExpiresAt: expires,
  });

  try {
    await sendActivationEmail(user, token);
  } catch (err) {
    console.error("Error enviando correo de activación:", err.message);
  }

  res.render("auth/login", {
    title: "Iniciar sesión - AppCenar",
    errors: {},
    old: {
      identity: user.email,
    },
    authError:
      "Registro completado. Revisa tu correo para activar tu cuenta antes de iniciar sesión.",
  });
}

async function handleCommerceRegister(req, res) {
  const errors = validationResult(req);
  const templateDataBase = await buildCommerceTemplateData(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register_comercio", {
      ...templateDataBase,
      errors: errors.mapped(),
    });
  }

  const plainPassword = req.body.password;
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let logoPath = null;
  if (req.file) {
    const relativePath = req.file.path.split("uploads")[1];
    logoPath = "/uploads" + relativePath.replace(/\\/g, "/");
  }

  const user = await User.create({
    nombre: req.body.nombreComercio,
    apellido: "",
    telefono: req.body.telefono,
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
    passwordHash,
    rol: "comercio",
    activo: false,
    avatar: logoPath,
    activationToken: token,
    activationTokenExpiresAt: expires,
  });

  await Commerce.create({
    nombre: req.body.nombreComercio,
    telefono: req.body.telefono,
    email: req.body.email.toLowerCase(),
    logo: logoPath,
    horarioApertura: req.body.horarioApertura,
    horarioCierre: req.body.horarioCierre,
    tipoComercio: req.body.tipoComercioId,
    usuario: user._id,
  });

  try {
    await sendActivationEmail(user, token);
  } catch (err) {
    console.error("Error enviando correo de activación:", err.message);
  }

  res.render("auth/login", {
    title: "Iniciar sesión - AppCenar",
    errors: {},
    old: {
      identity: user.email,
    },
    authError:
      "Registro de comercio completado. Revisa tu correo para activar tu cuenta antes de iniciar sesión.",
  });
}

module.exports = { authController };
