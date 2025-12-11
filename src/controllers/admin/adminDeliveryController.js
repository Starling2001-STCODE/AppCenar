const { User } = require("../../models/User");
const { Order } = require("../../models/Order");
const { buildAdminSidebar, SIDEBAR_OFFCANVAS_ID } = require("./adminHomeController");

const adminDeliveryController = {
    async list(req, res, next) {
        try {
            const deliveries = await User.find({ rol: "delivery" }).lean();

            const deliveryIds = deliveries.map(function (d) {
                return d._id;
            });

            const ordersGrouped = await Order.aggregate([
                {
                    $match: {
                        delivery: { $in: deliveryIds },
                        estado: "entregado",
                    },
                },
                {
                    $group: {
                        _id: "$delivery",
                        count: { $sum: 1 },
                    },
                },
            ]);

            const ordersByDelivery = {};
            ordersGrouped.forEach(function (o) {
                ordersByDelivery[String(o._id)] = o.count;
            });

            const repartidores = deliveries.map(function (d) {
                const id = String(d._id);
                return {
                    id: id,
                    nombreCompleto: (d.nombre || "") + " " + (d.apellido || ""),
                    telefono: d.telefono || "",
                    email: d.email || "",
                    pedidosEntregados: ordersByDelivery[id] || 0,
                    activo: !!d.activo,
                };
            });

            const sidebar = buildAdminSidebar("delivery");

            res.render("admin/delivery", {
                title: "Delivery - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                repartidores,
                hasRepartidores: repartidores.length > 0,
            });
        } catch (error) {
            next(error);
        }
    },

    async toggleStatus(req, res, next) {
        try {
            const deliveryId = req.params.id;

            const delivery = await User.findOne({ _id: deliveryId, rol: "delivery" });
            if (!delivery) {
                return res.redirect("/admin/delivery");
            }

            delivery.activo = !delivery.activo;
            await delivery.save();

            res.redirect("/admin/delivery");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { adminDeliveryController };
