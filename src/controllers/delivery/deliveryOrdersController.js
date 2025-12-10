const { Order } = require("../../models/Order");
const { User } = require("../../models/User");
const {
  buildDeliverySidebar,
  SIDEBAR_OFFCANVAS_ID,
} = require("./deliveryHomeController");

const deliveryOrdersController = {
  async listAssigned(req, res, next) {
    try {
      const userId = req.session.user.id;

      const ordersDocs = await Order.find({ delivery: userId })
        .sort({ createdAt: -1 })
        .populate("comercio", "nombre logo")
        .lean();

      const pedidos = ordersDocs.map(function (o) {
        let cantidadProductos = 0;
        if (Array.isArray(o.items)) {
          o.items.forEach(function (item) {
            const cantidad =
              typeof item.cantidad === "number" ? item.cantidad : 1;
            cantidadProductos += cantidad;
          });
        }

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

      const sidebar = buildDeliverySidebar("pedidos");

      res.render("delivery/pedidos", {
        title: "Mis pedidos asignados - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        pedidos,
        hasPedidos: pedidos.length > 0,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDetail(req, res, next) {
    try {
      const userId = req.session.user.id;
      const orderId = req.params.id;

      const orderDoc = await Order.findOne({
        _id: orderId,
        delivery: userId,
      })
        .populate("comercio", "nombre logo")
        .populate("cliente", "nombre apellido telefono")
        .populate("direccion")
        .lean();

      if (!orderDoc) {
        return res.redirect("/delivery/pedidos");
      }

      const items = Array.isArray(orderDoc.items)
        ? orderDoc.items.map(function (item) {
            const cantidad =
              typeof item.cantidad === "number" ? item.cantidad : 1;
            const precioUnitarioNumber =
              typeof item.precioUnitario === "number"
                ? item.precioUnitario
                : Number(item.precioUnitario || 0);
            const subtotalNumber =
              typeof item.subtotal === "number"
                ? item.subtotal
                : precioUnitarioNumber * cantidad;

            return {
              nombreProducto: item.nombreProducto || "",
              cantidad: cantidad,
              precioUnitarioFormatted: precioUnitarioNumber.toFixed(2),
              subtotalFormatted: subtotalNumber.toFixed(2),
            };
          })
        : [];

      const subtotalNumber =
        typeof orderDoc.subtotal === "number"
          ? orderDoc.subtotal
          : Number(orderDoc.subtotal || 0);
      const itbisNumber =
        typeof orderDoc.itbis === "number"
          ? orderDoc.itbis
          : Number(orderDoc.itbis || 0);
      const totalNumber =
        typeof orderDoc.total === "number"
          ? orderDoc.total
          : Number(orderDoc.total || 0);

      const comercioNombre = orderDoc.comercio
        ? orderDoc.comercio.nombre
        : "Comercio";
      const comercioLogo = orderDoc.comercio
        ? orderDoc.comercio.logo
        : null;

      const clienteNombreCompleto = orderDoc.cliente
        ? [orderDoc.cliente.nombre, orderDoc.cliente.apellido]
            .filter(Boolean)
            .join(" ")
        : "";
      const clienteTelefono = orderDoc.cliente
        ? orderDoc.cliente.telefono
        : "";

      const direccionData = orderDoc.direccion || null;

      const mostrarDireccion = orderDoc.estado === "proceso";

      const sidebar = buildDeliverySidebar("pedidos");

      res.render("delivery/pedido_detalle", {
        title: "Detalle del pedido - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        pedidoId: String(orderDoc._id),
        estado: orderDoc.estado,
        comercioNombre,
        comercioLogo,
        clienteNombreCompleto,
        clienteTelefono,
        items,
        subtotalFormatted: subtotalNumber.toFixed(2),
        itbisFormatted: itbisNumber.toFixed(2),
        totalFormatted: totalNumber.toFixed(2),
        creadoEn: orderDoc.createdAt
          ? orderDoc.createdAt.toLocaleString("es-DO")
          : "",
        mostrarDireccion,
        direccionAlias: direccionData ? direccionData.alias : "",
        direccionLinea1: direccionData ? direccionData.linea1 : "",
        direccionReferencia: direccionData ? direccionData.referencia : "",
      });
    } catch (error) {
      next(error);
    }
  },

  async postComplete(req, res, next) {
  try {
    const userId = req.session.user.id;
    const orderId = req.params.id;

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        delivery: userId,
      },
      {
        $set: { estado: "completado" },
      },
      { new: true }
    );

    if (!order) {
      return res.redirect("/delivery/pedidos");
    }

    await User.updateOne(
      { _id: userId, rol: "delivery" },
      { $set: { deliveryDisponible: true } }
    );

    return res.redirect("/delivery/pedidos/" + orderId);
  } catch (error) {
    next(error);
  }
},

};

module.exports = { deliveryOrdersController };
