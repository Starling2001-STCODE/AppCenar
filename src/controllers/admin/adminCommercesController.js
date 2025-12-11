const { Commerce } = require("../../models/Commerce");
const { Order } = require("../../models/Order");
const {
    buildAdminSidebar,
    SIDEBAR_OFFCANVAS_ID,
} = require("./adminHomeController");

const adminCommercesController = {
    async list(req, res, next) {
        try {
            const commerces = await Commerce.find().lean();

            const commerceIds = commerces.map(function (c) {
                return c._id;
            });

            const ordersGrouped = await Order.aggregate([
                {
                    $match: {
                        comercio: { $in: commerceIds },
                    },
                },
                {
                    $group: {
                        _id: "$comercio",
                        count: { $sum: 1 },
                    },
                },
            ]);

            const ordersByCommerce = {};
            ordersGrouped.forEach(function (o) {
                ordersByCommerce[String(o._id)] = o.count;
            });

            const comercios = commerces.map(function (c) {
                const id = String(c._id);
                return {
                    id: id,
                    nombre: c.nombre || "",
                    telefono: c.telefono || "",
                    email: c.email || "",
                    logo: c.logo || "",
                    pedidosCount: ordersByCommerce[id] || 0,
                    activo: !!c.activo,
                };
            });

            const sidebar = buildAdminSidebar("comercios");

            res.render("admin/comercios", {
                title: "Comercios - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                comercios,
                hasComercios: comercios.length > 0,
            });
        } catch (error) {
            next(error);
        }
    },

    async toggleStatus(req, res, next) {
        try {
            const commerceId = req.params.id;

            const commerce = await Commerce.findById(commerceId);
            if (!commerce) {
                return res.redirect("/admin/comercios");
            }

            commerce.activo = !commerce.activo;
            await commerce.save();

            return res.redirect("/admin/comercios");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { adminCommercesController };
