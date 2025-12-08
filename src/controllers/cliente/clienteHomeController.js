const { CommerceType } = require("../../models/CommerceType");
const { Commerce } = require("../../models/Commerce");

const SIDEBAR_OFFCANVAS_ID = "clienteSidebarOffcanvas";

function buildClienteSidebar(activeKey) {
  return {
    title: "Menú del Cliente",
    items: [
      { href: "/cliente/home", label: "Inicio", icon: "bi bi-house", active: activeKey === "home" },
      { href: "/cliente/perfil", label: "Perfil", icon: "bi bi-person", active: activeKey === "perfil" },
      { href: "/cliente/pedidos", label: "Pedidos", icon: "bi bi-receipt", active: activeKey === "pedidos" },
      { href: "/cliente/direcciones", label: "Direcciones", icon: "bi bi-geo-alt", active: activeKey === "direcciones" },
      { href: "/cliente/favoritos", label: "Favoritos", icon: "bi bi-heart", active: activeKey === "favoritos" },
      { href: "/logout", label: "Cerrar sesión", icon: "bi bi-box-arrow-right", danger: true },
    ],
  };
}

const clienteHomeController = {
  async getHome(req, res, next) {
    try {
      const tiposComercio = await CommerceType.find({ activo: true }).sort({ nombre: 1 }).lean();

      const sidebar = buildClienteSidebar("home");

      res.render("cliente/home", {
        title: "Home Cliente - AppCenar",
        tiposComercio,
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCommercesByType(req, res, next) {
    try {
      const tipoId = req.params.tipoId;

      const tipoComercio = await CommerceType.findById(tipoId).lean();
      if (!tipoComercio) {
        return res.redirect("/cliente/home");
      }

      const comercios = await Commerce.find({ tipoComercio: tipoId }).sort({ nombre: 1 }).lean();

      const sidebar = buildClienteSidebar("home");

      res.render("cliente/commerces_by_type", {
        title: `Comercios de ${tipoComercio.nombre} - AppCenar`,
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        tipoComercio,
        comercios,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { clienteHomeController };
