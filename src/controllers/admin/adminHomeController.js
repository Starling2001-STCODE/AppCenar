const { Order } = require("../../models/Order");
const { Product } = require("../../models/Product");
const { Commerce } = require("../../models/Commerce");
const { User } = require("../../models/User");

const SIDEBAR_OFFCANVAS_ID = "adminSidebarOffcanvas";

function buildAdminSidebar(activeKey) {
  return {
    title: "Panel del Administrador",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: "bi bi-speedometer2",
        active: activeKey === "dashboard",
      },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: "bi bi-people",
        active: activeKey === "clientes",
      },
      {
        href: "/admin/delivery",
        label: "Delivery",
        icon: "bi bi-bicycle",
        active: activeKey === "delivery",
      },
      {
        href: "/admin/comercios",
        label: "Comercios",
        icon: "bi bi-shop",
        active: activeKey === "comercios",
      },
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: "bi bi-gear",
        active: activeKey === "configuracion",
      },
      {
        href: "/admin/administradores",
        label: "Administradores",
        icon: "bi bi-person-gear",
        active: activeKey === "administradores",
      },
      {
        href: "/admin/tipos-comercios",
        label: "Tipos de Comercios",
        icon: "bi bi-diagram-3",
        active: activeKey === "tipos-comercios",
      },
      {
        href: "/logout",
        label: "Cerrar sesión",
        icon: "bi bi-box-arrow-right",
        danger: true,
        active: false,
      },
    ],
  };
}

const adminHomeController = {
  async getDashboard(req, res, next) {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [
        totalOrders,
        todaysOrders,
        totalProducts,
        activeCommerces,
        inactiveCommerces,
        activeClients,
        inactiveClients,
        activeDeliveries,
        inactiveDeliveries,
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        }),
        Product.countDocuments(),
        Commerce.countDocuments({ activo: true }),
        Commerce.countDocuments({ activo: false }),
        User.countDocuments({ rol: "cliente", activo: true }),
        User.countDocuments({ rol: "cliente", activo: false }),
        User.countDocuments({ rol: "delivery", activo: true }),
        User.countDocuments({ rol: "delivery", activo: false }),
      ]);

      const sidebar = buildAdminSidebar("dashboard");

      res.render("admin/dashboard", {
        title: "Dashboard Administrador - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        metrics: {
          totalOrders,
          todaysOrders,
          totalProducts,
          commerces: {
            active: activeCommerces,
            inactive: inactiveCommerces,
          },
          clients: {
            active: activeClients,
            inactive: inactiveClients,
          },
          deliveries: {
            active: activeDeliveries,
            inactive: inactiveDeliveries,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = {
  adminHomeController,
  buildAdminSidebar,
  SIDEBAR_OFFCANVAS_ID,
};
