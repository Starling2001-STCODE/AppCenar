const { Order } = require("../../models/Order");
const { Commerce } = require("../../models/Commerce");

const SIDEBAR_OFFCANVAS_ID = "deliverySidebarOffcanvas";

function buildDeliverySidebar(activeKey) {
  return {
    title: "Panel del Delivery",
    items: [
      {
        href: "/delivery/home",
        label: "Home",
        icon: "bi bi-house",
        active: activeKey === "home",
      },
      {
        href: "/delivery/pedidos",
        label: "Pedidos asignados",
        icon: "bi bi-receipt",
        active: activeKey === "pedidos",
      },
      {
        href: "/delivery/perfil",
        label: "Perfil",
        icon: "bi bi-person",
        active: activeKey === "perfil",
      },
      {
        href: "/logout",
        label: "Cerrar sesión",
        icon: "bi bi-box-arrow-right",
        danger: true,
      },
    ],
  };
}


const deliveryHomeController = {
  async getHome(req, res, next) {
    try {
      const userId = req.session.user.id;

      const ordersDocs = await Order.find({ delivery: userId })
        .sort({ createdAt: -1 })
        .populate("comercio", "nombre logo")
        .lean();

      const pedidos = ordersDocs.map(function (o) {
        const cantidadProductos = Array.isArray(o.items) ? o.items.length : 0;
        const totalNumber =
          typeof o.total === "number" ? o.total : Number(o.total || 0);
        return {
          id: String(o._id),
          comercioNombre: o.comercio ? o.comercio.nombre : "Comercio",
          comercioLogo: o.comercio ? o.comercio.logo : null,
          estado: o.estado,
          totalFormatted: totalNumber.toFixed(2),
          cantidadProductos: cantidadProductos,
          creadoEn: o.createdAt
            ? o.createdAt.toLocaleString("es-DO")
            : "",
        };
      });

      const sidebar = buildDeliverySidebar("home");

      res.render("delivery/home", {
        title: "Home Delivery - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        pedidos,
        hasPedidos: pedidos.length > 0,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { deliveryHomeController, buildDeliverySidebar, SIDEBAR_OFFCANVAS_ID };
