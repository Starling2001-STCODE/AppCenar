const { Address } = require("../../models/Address");
const { Order } = require("../../models/Order");
const { getCartProductsAndSummary } = require("../../services/cartSummaryService");
const { buildClienteSidebar, SIDEBAR_OFFCANVAS_ID } = require("./clienteHomeController");

const clienteOrderController = {
    async createOrder(req, res, next) {
        try {
            const result = await getCartProductsAndSummary(req);

            if (!result || !result.summary.hasItems) {
                return res.redirect("/cliente/carrito");
            }

            const products = result.products;
            const summary = result.summary;
            const direccionId = (req.body.direccionId || "").trim();

            if (!direccionId) {
                const direcciones = await Address.find({
                    usuario: req.session.user.id,
                    activo: true,
                })
                    .sort({ createdAt: -1 })
                    .lean();

                const sidebar = buildClienteSidebar("direcciones");

                return res.status(422).render("cliente/checkout_direccion", {
                    title: "Seleccionar dirección - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    direcciones,
                    hasAddresses: direcciones.length > 0,
                    formError: "Debes seleccionar una dirección.",
                    old: {},
                    comercioNombre: summary.comercioNombre,
                    subtotalFormatted: summary.subtotalFormatted,
                    itbisFormatted: summary.itbisFormatted,
                    totalFormatted: summary.totalFormatted,
                });
            }

            const direccion = await Address.findOne({
                _id: direccionId,
                usuario: req.session.user.id,
                activo: true,
            }).lean();

            if (!direccion) {
                const direcciones = await Address.find({
                    usuario: req.session.user.id,
                    activo: true,
                })
                    .sort({ createdAt: -1 })
                    .lean();

                const sidebar = buildClienteSidebar("direcciones");

                return res.status(422).render("cliente/checkout_direccion", {
                    title: "Seleccionar dirección - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    direcciones,
                    hasAddresses: direcciones.length > 0,
                    formError: "La dirección seleccionada no es válida.",
                    old: {},
                    comercioNombre: summary.comercioNombre,
                    subtotalFormatted: summary.subtotalFormatted,
                    itbisFormatted: summary.itbisFormatted,
                    totalFormatted: summary.totalFormatted,
                });
            }

            const firstCommerce = products[0].comercio;
            const comercioId = firstCommerce ? String(firstCommerce._id) : null;

            const singleCommerce = products.every(function (p) {
                if (!p.comercio) {
                    return false;
                }
                return String(p.comercio._id) === String(comercioId);
            });

            if (!singleCommerce || !comercioId) {
                return res
                    .status(400)
                    .send("No se puede crear un pedido con productos de comercios diferentes.");
            }

            const items = products.map(function (p) {
                return {
                    producto: p._id,
                    nombre: p.nombre,
                    precio: p.precio,
                };
            });

            const orderDoc = await Order.create({
                cliente: req.session.user.id,
                comercio: comercioId,
                direccion: direccion._id,
                items,
                subtotal: summary.subtotal,
                itbis: summary.itbis,
                total: summary.total,
                estado: "pendiente",
            });

            const order = orderDoc.toObject();

            req.session.cart = { items: [] };

            const sidebar = buildClienteSidebar("pedidos");

            res.render("cliente/pedido_creado", {
                title: "Pedido creado - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                pedidoId: String(order._id),
                pedidoEstado: order.estado,
                pedidoFecha: order.createdAt,
                comercioNombre: summary.comercioNombre,
                subtotalFormatted: summary.subtotalFormatted,
                itbisFormatted: summary.itbisFormatted,
                totalFormatted: summary.totalFormatted,
            });
        } catch (error) {
            next(error);
        }
    },

    async getMyOrders(req, res, next) {
        try {
            const pedidosDocs = await Order.find({ cliente: req.session.user.id })
                .populate("comercio", "nombre logo")
                .sort({ createdAt: -1 })
                .lean();

            const pedidos = pedidosDocs.map(function (o) {
                return {
                    id: String(o._id),
                    comercioNombre: o.comercio ? o.comercio.nombre : "",
                    comercioLogo: o.comercio ? o.comercio.logo : null,
                    estado: o.estado,
                    total: o.total,
                    cantidadProductos: o.items ? o.items.length : 0,
                    fechaCreacion: o.createdAt,
                };
            });

            const sidebar = buildClienteSidebar("pedidos");

            res.render("cliente/pedidos", {
                title: "Mis pedidos - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                pedidos,
                hasOrders: pedidos.length > 0,
            });
        } catch (error) {
            next(error);
        }
    },

    async getOrderDetail(req, res, next) {
        try {
            const orderId = req.params.orderId;

            const order = await Order.findOne({
                _id: orderId,
                cliente: req.session.user.id,
            })
                .populate("comercio", "nombre logo")
                .lean();

            if (!order) {
                return res.redirect("/cliente/pedidos");
            }

            const items = (order.items || []).map(function (i) {
                return {
                    nombre: i.nombre,
                    precio: i.precio,
                };
            });

            const fechaCreacion = order.createdAt
                ? order.createdAt.toLocaleString("es-DO")
                : "";

            const sidebar = buildClienteSidebar("pedidos");

            res.render("cliente/pedido_detalle", {
                title: "Detalle de pedido - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                pedidoId: String(order._id),
                pedidoEstado: order.estado,
                pedidoFecha: fechaCreacion,
                comercioNombre: order.comercio ? order.comercio.nombre : "",
                comercioLogo: order.comercio ? order.comercio.logo : null,
                subtotalFormatted: order.subtotal.toFixed(2),
                itbisFormatted: order.itbis.toFixed(2),
                totalFormatted: order.total.toFixed(2),
                items,
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { clienteOrderController };
