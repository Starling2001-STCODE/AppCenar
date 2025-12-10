const { Commerce } = require("../../models/Commerce");
const { Order } = require("../../models/Order");

const SIDEBAR_OFFCANVAS_ID = "comercioSidebarOffcanvas";

function buildComercioSidebar(activeKey) {
  return {
    title: "Panel del comercio",
    items: [
      { href: "/comercio/home", label: "Home", icon: "bi bi-house", active: activeKey === "home" },
      { href: "/comercio/perfil", label: "Perfil", icon: "bi bi-person", active: activeKey === "perfil" },
      { href: "/comercio/pedidos", label: "Pedidos", icon: "bi bi-receipt", active: activeKey === "pedidos" },
      { href: "/comercio/categorias", label: "Categorías", icon: "bi bi-tags", active: activeKey === "categorias" },
      { href: "/comercio/productos", label: "Productos", icon: "bi bi-basket", active: activeKey === "productos" },
      { href: "/logout", label: "Cerrar sesión", icon: "bi bi-box-arrow-right", danger: true },
    ],
  };
}


const comercioHomeController = {
  async getHome(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const pedidosDocs = await Order.find({ comercio: comercio._id })
        .populate("cliente", "nombre apellido")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const pedidos = pedidosDocs.map(function (o) {
        return {
          id: String(o._id),
          clienteNombre: o.cliente
            ? (o.cliente.nombre || "") +
              (o.cliente.apellido ? " " + o.cliente.apellido : "")
            : "",
          estado: o.estado,
          total: o.total,
          cantidadProductos: o.items ? o.items.length : 0,
          fechaCreacion: o.createdAt,
        };
      });

      const sidebar = buildComercioSidebar("home");

      res.render("comercio/home", {
        title: "Home del comercio - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        pedidos,
        hasPedidos: pedidos.length > 0,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = {
  comercioHomeController,
  buildComercioSidebar,
  SIDEBAR_OFFCANVAS_ID,
};
