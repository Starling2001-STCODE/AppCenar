const { validationResult } = require("express-validator");
const { Address } = require("../../models/Address");
const { buildClienteSidebar, SIDEBAR_OFFCANVAS_ID } = require("./clienteHomeController");

function buildFormData(body) {
    return {
        alias: body.alias || "",
        linea1: body.linea1 || "",
        referencia: body.referencia || "",
    };
}

const clienteAddressController = {
    async listAddresses(req, res, next) {
        try {
            const direcciones = await Address.find({
                usuario: req.session.user.id,
                activo: true,
            })
                .sort({ createdAt: -1 })
                .lean();

            const sidebar = buildClienteSidebar("direcciones");

            res.render("cliente/direcciones", {
                title: "Mis direcciones - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                direcciones,
                hasAddresses: direcciones.length > 0,
                errors: {},
                formError: null,
                old: {},
            });
        } catch (error) {
            next(error);
        }
    },

    async createAddress(req, res, next) {
        try {
            const result = validationResult(req);
            const formData = buildFormData(req.body);

            const direcciones = await Address.find({
                usuario: req.session.user.id,
                activo: true,
            })
                .sort({ createdAt: -1 })
                .lean();

            if (!result.isEmpty()) {
                const sidebar = buildClienteSidebar("direcciones");

                return res.status(422).render("cliente/direcciones", {
                    title: "Mis direcciones - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    direcciones,
                    hasAddresses: direcciones.length > 0,
                    errors: result.mapped(),
                    formError: null,
                    old: formData,
                });
            }

            await Address.create({
                usuario: req.session.user.id,
                alias: formData.alias.trim(),
                linea1: formData.linea1.trim(),
                referencia: formData.referencia.trim(),
            });

            return res.redirect("/cliente/direcciones");
        } catch (error) {
            next(error);
        }
    },

    async getEditAddress(req, res, next) {
        try {
            const addressId = req.params.addressId;

            const direccion = await Address.findOne({
                _id: addressId,
                usuario: req.session.user.id,
                activo: true,
            }).lean();

            if (!direccion) {
                return res.redirect("/cliente/direcciones");
            }

            const sidebar = buildClienteSidebar("direcciones");

            res.render("cliente/direccion_editar", {
                title: "Editar dirección - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                direccion: {
                    id: String(direccion._id),
                    alias: direccion.alias || "",
                    linea1: direccion.linea1 || "",
                    referencia: direccion.referencia || "",
                },
                errors: {},
            });
        } catch (error) {
            next(error);
        }
    },

    async updateAddress(req, res, next) {
        try {
            const addressId = req.params.addressId;

            const direccion = await Address.findOne({
                _id: addressId,
                usuario: req.session.user.id,
                activo: true,
            });

            if (!direccion) {
                return res.redirect("/cliente/direcciones");
            }

            const result = validationResult(req);
            const formData = buildFormData(req.body);

            if (!result.isEmpty()) {
                const sidebar = buildClienteSidebar("direcciones");

                return res.status(422).render("cliente/direccion_editar", {
                    title: "Editar dirección - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    direccion: {
                        id: String(direccion._id),
                        alias: formData.alias,
                        linea1: formData.linea1,
                        referencia: formData.referencia,
                    },
                    errors: result.mapped(),
                });
            }

            direccion.alias = formData.alias.trim();
            direccion.linea1 = formData.linea1.trim();
            direccion.referencia = formData.referencia.trim();

            await direccion.save();

            return res.redirect("/cliente/direcciones");
        } catch (error) {
            next(error);
        }
    },

    async deleteAddress(req, res, next) {
        try {
            const addressId = req.params.addressId;

            const direccion = await Address.findOne({
                _id: addressId,
                usuario: req.session.user.id,
                activo: true,
            });

            if (!direccion) {
                return res.redirect("/cliente/direcciones");
            }

            direccion.activo = false;
            await direccion.save();

            return res.redirect("/cliente/direcciones");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { clienteAddressController };
