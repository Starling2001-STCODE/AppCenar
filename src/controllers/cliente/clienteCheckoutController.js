const { Address } = require("../../models/Address");
const { buildClienteSidebar, SIDEBAR_OFFCANVAS_ID } = require("./clienteHomeController");
const { getCartProductsAndSummary } = require("../../services/cartSummaryService");

const clienteCheckoutController = {
    async selectAddress(req, res, next) {
        try {
            const result = await getCartProductsAndSummary(req);

            if (!result || !result.summary.hasItems) {
                return res.redirect("/cliente/carrito");
            }

            const summary = result.summary;

            const direcciones = await Address.find({
                usuario: req.session.user.id,
                activo: true,
            })
                .sort({ createdAt: -1 })
                .lean();

            const sidebar = buildClienteSidebar("direcciones");

            res.render("cliente/checkout_direccion", {
                title: "Seleccionar dirección - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                direcciones,
                hasAddresses: direcciones.length > 0,
                formError: null,
                old: {},
                comercioNombre: summary.comercioNombre,
                subtotalFormatted: summary.subtotalFormatted,
                itbisFormatted: summary.itbisFormatted,
                totalFormatted: summary.totalFormatted,
            });
        } catch (error) {
            next(error);
        }
    },

    async createAddressFromCheckout(req, res, next) {
        try {
            const result = await getCartProductsAndSummary(req);

            if (!result || !result.summary.hasItems) {
                return res.redirect("/cliente/carrito");
            }

            const summary = result.summary;

            const alias = (req.body.alias || "").trim();
            const linea1 = (req.body.linea1 || "").trim();
            const referencia = (req.body.referencia || "").trim();

            if (!linea1) {
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
                    formError: "La dirección es obligatoria.",
                    old: { alias, linea1, referencia },
                    comercioNombre: summary.comercioNombre,
                    subtotalFormatted: summary.subtotalFormatted,
                    itbisFormatted: summary.itbisFormatted,
                    totalFormatted: summary.totalFormatted,
                });
            }

            await Address.create({
                usuario: req.session.user.id,
                alias,
                linea1,
                referencia,
            });

            return res.redirect("/cliente/checkout/direccion");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { clienteCheckoutController };
