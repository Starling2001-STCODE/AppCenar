const { Order } = require("../../models/Order");
const { Commerce } = require("../../models/Commerce");
const { User } = require("../../models/User");
const {
  buildComercioSidebar,
  SIDEBAR_OFFCANVAS_ID,
} = require("./comercioHomeController");

const comercioOrderController = {
  async getOrders(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const pedidosDocs = await Order.find({ comercio: comercio._id })
        .populate("cliente", "nombre apellido")
        .sort({ createdAt: -1 })
        .lean();

      const pedidos = pedidosDocs.map(function (o) {
        const clienteNombre = o.cliente
          ? (o.cliente.nombre || "") +
          (o.cliente.apellido ? " " + o.cliente.apellido : "")
          : "Cliente";

        const fechaCreacion = o.createdAt
          ? o.createdAt.toLocaleString("es-DO")
          : "";

        return {
          id: String(o._id),
          clienteNombre,
          estado: o.estado,
          totalFormatted: o.total != null ? o.total.toFixed(2) : "0.00",
          cantidadProductos: o.items ? o.items.length : 0,
          fechaCreacion,
        };
      });

      const sidebar = buildComercioSidebar("pedidos");

      res.render("comercio/pedidos", {
        title: "Pedidos del comercio - AppCenar",
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

  async getOrderDetail(req, res, next) {
    try {
      const userId = req.session.user.id;
      const orderId = req.params.orderId;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const order = await Order.findOne({
        _id: orderId,
        comercio: comercio._id,
      })
        .populate("cliente", "nombre apellido telefono email")
        .populate("direccion")
        .lean();

      if (!order) {
        return res.redirect("/comercio/pedidos");
      }

      const clienteNombre = order.cliente
        ? (order.cliente.nombre || "") +
        (order.cliente.apellido ? " " + order.cliente.apellido : "")
        : "Cliente";

      const clienteTelefono =
        order.cliente && order.cliente.telefono
          ? order.cliente.telefono
          : "";
      const clienteEmail =
        order.cliente && order.cliente.email ? order.cliente.email : "";

      const fechaCreacion = order.createdAt
        ? order.createdAt.toLocaleString("es-DO")
        : "";

      const items = (order.items || []).map(function (i) {
        return {
          nombre: i.nombre,
          precioFormatted: i.precio != null ? i.precio.toFixed(2) : "0.00",
        };
      });

      const subtotalFormatted =
        order.subtotal != null ? order.subtotal.toFixed(2) : "0.00";
      const itbisFormatted =
        order.itbis != null ? order.itbis.toFixed(2) : "0.00";
      const totalFormatted =
        order.total != null ? order.total.toFixed(2) : "0.00";

      let direccionData = null;
      if (order.direccion) {
        direccionData = {
          alias: order.direccion.alias || "",
          linea1: order.direccion.linea1 || "",
          referencia: order.direccion.referencia || "",
        };
      }

      const canAssignDelivery = order.estado === "pendiente";

      const showAddress = order.estado === "proceso" && !!direccionData;

      const sidebar = buildComercioSidebar("pedidos");

      res.render("comercio/pedido_detalle", {
        title: "Detalle de pedido - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        pedidoId: String(order._id),
        pedidoEstado: order.estado,
        pedidoFecha: fechaCreacion,
        clienteNombre,
        clienteTelefono,
        clienteEmail,
        items,
        subtotalFormatted,
        itbisFormatted,
        totalFormatted,
        direccion: direccionData,
        showAddress,
        canAssignDelivery,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAssignDelivery(req, res, next) {
    try {
      const userId = req.session.user.id;
      const orderId = req.params.orderId;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const order = await Order.findOne({
        _id: orderId,
        comercio: comercio._id,
      })
        .populate("cliente", "nombre apellido telefono email")
        .lean();

      if (!order) {
        return res.redirect("/comercio/pedidos");
      }

      if (order.estado !== "pendiente") {
        return res.redirect("/comercio/pedidos/" + orderId);
      }

      const deliveriesDocs = await User.find({
        rol: "delivery",
        activo: true,
        deliveryDisponible: true,
      })
        .select("nombre apellido telefono email avatar")
        .sort({ nombre: 1 })
        .lean();

      const deliveries = deliveriesDocs.map(function (d) {
        const nombreCompleto =
          (d.nombre || "") + (d.apellido ? " " + d.apellido : "");
        return {
          id: String(d._id),
          nombre: nombreCompleto || "Delivery",
          telefono: d.telefono || "",
          email: d.email || "",
          avatar: d.avatar || null,
        };
      });

      const clienteNombre = order.cliente
        ? (order.cliente.nombre || "") +
        (order.cliente.apellido ? " " + order.cliente.apellido : "")
        : "Cliente";

      const fechaCreacion = order.createdAt
        ? order.createdAt.toLocaleString("es-DO")
        : "";

      const sidebar = buildComercioSidebar("pedidos");

      res.render("comercio/pedido_asignar_delivery", {
        title: "Asignar delivery - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        pedidoId: String(order._id),
        pedidoEstado: order.estado,
        pedidoFecha: fechaCreacion,
        clienteNombre,
        deliveries,
        hasDeliveries: deliveries.length > 0,
        formError: null,
        selectedDeliveryId: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async postAssignDelivery(req, res, next) {
    try {
      const userId = req.session.user.id;
      const orderId = req.params.orderId;
      const deliveryId = req.body.deliveryId;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const order = await Order.findOne({
        _id: orderId,
        comercio: comercio._id,
      }).populate("cliente", "nombre apellido telefono email");

      if (!order) {
        return res.redirect("/comercio/pedidos");
      }

      if (order.estado !== "pendiente") {
        return res.redirect("/comercio/pedidos/" + orderId);
      }

      const deliveriesDocs = await User.find({
        rol: "delivery",
        activo: true,
        deliveryDisponible: true,
      })
        .select("nombre apellido telefono email avatar")
        .sort({ nombre: 1 })
        .lean();

      const deliveries = deliveriesDocs.map(function (d) {
        const nombreCompleto =
          (d.nombre || "") + (d.apellido ? " " + d.apellido : "");
        return {
          id: String(d._id),
          nombre: nombreCompleto || "Delivery",
          telefono: d.telefono || "",
          email: d.email || "",
          avatar: d.avatar || null,
        };
      });

      const clienteNombre = order.cliente
        ? (order.cliente.nombre || "") +
        (order.cliente.apellido ? " " + order.cliente.apellido : "")
        : "Cliente";

      const fechaCreacion = order.createdAt
        ? order.createdAt.toLocaleString("es-DO")
        : "";

      if (!deliveryId) {
        const sidebar = buildComercioSidebar("pedidos");

        return res.status(422).render("comercio/pedido_asignar_delivery", {
          title: "Asignar delivery - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioNombre: comercio.nombre,
          comercioLogo: comercio.logo,
          pedidoId: String(order._id),
          pedidoEstado: order.estado,
          pedidoFecha: fechaCreacion,
          clienteNombre,
          deliveries,
          hasDeliveries: deliveries.length > 0,
          formError: "Debes seleccionar un delivery.",
          selectedDeliveryId: null,
        });
      }

      const delivery = await User.findOne({
        _id: deliveryId,
        rol: "delivery",
        activo: true,
        deliveryDisponible: true,
      });

      if (!delivery) {
        const sidebar = buildComercioSidebar("pedidos");

        return res.status(422).render("comercio/pedido_asignar_delivery", {
          title: "Asignar delivery - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioNombre: comercio.nombre,
          comercioLogo: comercio.logo,
          pedidoId: String(order._id),
          pedidoEstado: order.estado,
          pedidoFecha: fechaCreacion,
          clienteNombre,
          deliveries,
          hasDeliveries: deliveries.length > 0,
          formError: "El delivery seleccionado no está disponible.",
          selectedDeliveryId: deliveryId,
        });
      }

      order.delivery = delivery._id;
      order.estado = "proceso";
      order.deliveryAssignedAt = new Date();
      await order.save();

      delivery.deliveryDisponible = false;
      await delivery.save();

      return res.redirect("/comercio/pedidos/" + orderId);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { comercioOrderController };
