const { User } = require("../../models/User");
const { Commerce } = require("../../models/Commerce");
const {
  buildClienteSidebar,
  SIDEBAR_OFFCANVAS_ID,
} = require("./clienteHomeController");

const clienteFavoritesController = {
  async toggleFavorite(req, res, next) {
    try {
      const userSession = req.session.user;
      const commerceId = req.params.commerceId;

      if (!userSession || !userSession.id) {
        return res.status(401).json({ ok: false, message: "No autenticado" });
      }

      const commerce = await Commerce.findById(commerceId).select("_id").lean();
      if (!commerce) {
        return res.status(404).json({ ok: false, message: "Comercio no encontrado" });
      }

      const user = await User.findById(userSession.id).select("favoritos");
      if (!user) {
        return res.status(401).json({ ok: false, message: "Usuario no encontrado" });
      }

      const currentIds = user.favoritos.map(String);
      const exists = currentIds.includes(String(commerceId));

      if (exists) {
        user.favoritos = user.favoritos.filter(function (id) {
          return String(id) !== String(commerceId);
        });
      } else {
        user.favoritos.push(commerceId);
      }

      await user.save();

      return res.json({
        ok: true,
        isFavorite: !exists,
      });
    } catch (error) {
      next(error);
    }
  },

  async listFavorites(req, res, next) {
    try {
      const userSession = req.session.user;

      if (!userSession || !userSession.id) {
        return res.redirect("/login");
      }

      const user = await User.findById(userSession.id)
        .select("favoritos")
        .lean();

      const favoritosIds = user && user.favoritos
        ? user.favoritos.map(function (id) {
            return String(id);
          })
        : [];

      let comercios = [];

      if (favoritosIds.length > 0) {
        const docs = await Commerce.find({ _id: { $in: favoritosIds } })
          .sort({ nombre: 1 })
          .lean();

        comercios = docs.map(function (c) {
          return Object.assign({}, c, { isFavorite: true });
        });
      }

      const sidebar = buildClienteSidebar("favoritos");
      const totalComercios = comercios.length;

      res.render("cliente/favoritos", {
        title: "Mis comercios favoritos - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercios,
        totalComercios,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { clienteFavoritesController };
