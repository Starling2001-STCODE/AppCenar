const { validationResult } = require("express-validator");
const { Commerce } = require("../../models/Commerce");
const { User } = require("../../models/User");
const {
  buildComercioSidebar,
  SIDEBAR_OFFCANVAS_ID,
} = require("./comercioHomeController");

function buildFormData(body, comercio) {
  return {
    nombre: comercio ? comercio.nombre : "",
    telefono: body.telefono || (comercio ? comercio.telefono : ""),
    email: body.email || (comercio ? comercio.email : ""),
    horarioApertura:
      body.horarioApertura || (comercio ? comercio.horarioApertura : ""),
    horarioCierre:
      body.horarioCierre || (comercio ? comercio.horarioCierre : ""),
  };
}

const comercioProfileController = {
  async getProfile(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("nombre telefono email horarioApertura horarioCierre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const sidebar = buildComercioSidebar("perfil");

      const formData = buildFormData({}, comercio);

      res.render("comercio/perfil", {
        title: "Perfil del comercio - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioLogo: comercio.logo,
        formData,
        errors: {},
        successMessage: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async postProfile(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId });
      if (!comercio) {
        return res.redirect("/");
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.redirect("/");
      }

      const result = validationResult(req);
      const sidebar = buildComercioSidebar("perfil");
      const formData = buildFormData(req.body, comercio);

      let newLogoPath = comercio.logo;
      if (req.file) {
        const relativePath = req.file.path.split("uploads")[1];
        newLogoPath = "/uploads" + relativePath.replace(/\\/g, "/");
      }

      if (!result.isEmpty()) {
        return res.status(422).render("comercio/perfil", {
          title: "Perfil del comercio - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioLogo: newLogoPath,
          formData,
          errors: result.mapped(),
          successMessage: null,
        });
      }

      comercio.telefono = formData.telefono.trim();
      comercio.email = formData.email.trim().toLowerCase();
      comercio.horarioApertura = formData.horarioApertura.trim();
      comercio.horarioCierre = formData.horarioCierre.trim();
      comercio.logo = newLogoPath;

      user.telefono = formData.telefono.trim();
      user.email = formData.email.trim().toLowerCase();
      user.avatar = newLogoPath;

      await comercio.save();
      await user.save();

      res.render("comercio/perfil", {
        title: "Perfil del comercio - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioLogo: newLogoPath,
        formData,
        errors: {},
        successMessage: "Perfil actualizado correctamente.",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { comercioProfileController };
