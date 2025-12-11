const { User } = require("../../models/User");
const { Order } = require("../../models/Order");
const { buildAdminSidebar, SIDEBAR_OFFCANVAS_ID } = require("./adminHomeController");

const adminClientsController = {
    async list(req, res, next) {
        try {
            const clients = await User.find({ rol: "cliente" }).lean();

            const clientIds = clients.map(function (c) {
                return c._id;
            });

            const ordersGrouped = await Order.aggregate([
                { $match: { cliente: { $in: clientIds } } },
                {
                    $group: {
                        _id: "$cliente",
                        count: { $sum: 1 },
                    },
                },
            ]);

            const ordersByClient = {};
            ordersGrouped.forEach(function (o) {
                ordersByClient[String(o._id)] = o.count;
            });

            const clientes = clients.map(function (c) {
                const id = String(c._id);
                return {
                    id: id,
                    nombreCompleto: (c.nombre || "") + " " + (c.apellido || ""),
                    telefono: c.telefono || "",
                    email: c.email || "",
                    pedidosCount: ordersByClient[id] || 0,
                    activo: !!c.activo,
                };
            });

            const sidebar = buildAdminSidebar("clientes");

            res.render("admin/clientes", {
                title: "Clientes - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                clientes,
                hasClientes: clientes.length > 0,
            });
        } catch (error) {
            next(error);
        }
    },

    async toggleStatus(req, res, next) {
        try {
            const clientId = req.params.id;

            const client = await User.findOne({ _id: clientId, rol: "cliente" });
            if (!client) {
                return res.redirect("/admin/clientes");
            }

            client.activo = !client.activo;
            await client.save();

            res.redirect("/admin/clientes");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { adminClientsController };
