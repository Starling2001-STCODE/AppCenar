const { validationResult } = require("express-validator");
const { CommerceType } = require("../../models/CommerceType");
const { buildAdminSidebar, SIDEBAR_OFFCANVAS_ID } = require("./adminHomeController");

const adminTypesController = {
    async list(req, res, next) {
        try {
            const types = await CommerceType.find().sort({ nombre: 1 }).lean();

            const sidebar = buildAdminSidebar("tipos-comercios");

            res.render("admin/tipos_comercio", {
                title: "Tipos de Comercios - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                tipos: types.map(function (t) {
                    return {
                        id: String(t._id),
                        nombre: t.nombre,
                        descripcion: t.descripcion || "",
                        activo: !!t.activo,
                    };
                }),
                hasTipos: types.length > 0,
            });
        } catch (error) {
            next(error);
        }
    },

    async getCreate(req, res, next) {
        try {
            const sidebar = buildAdminSidebar("tipos-comercios");

            res.render("admin/tipo_comercio_form", {
                title: "Nuevo Tipo de Comercio",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                isEdit: false,
                typeId: null,
                formData: { nombre: "", descripcion: "" },
                errors: {},
            });
        } catch (error) {
            next(error);
        }
    },

    async postCreate(req, res, next) {
        try {
            const result = validationResult(req);

            const formData = {
                nombre: req.body.nombre || "",
                descripcion: req.body.descripcion || "",
            };

            const sidebar = buildAdminSidebar("tipos-comercios");

            if (!result.isEmpty()) {
                return res.status(422).render("admin/tipo_comercio_form", {
                    title: "Nuevo Tipo de Comercio",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    isEdit: false,
                    typeId: null,
                    formData,
                    errors: result.mapped(),
                });
            }

            await CommerceType.create({
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim(),
                activo: true,
            });

            res.redirect("/admin/tipos-comercios");
        } catch (error) {
            next(error);
        }
    },

    async getEdit(req, res, next) {
        try {
            const typeId = req.params.id;

            const type = await CommerceType.findById(typeId).lean();
            if (!type) {
                return res.redirect("/admin/tipos-comercios");
            }

            const sidebar = buildAdminSidebar("tipos-comercios");

            res.render("admin/tipo_comercio_form", {
                title: "Editar Tipo de Comercio",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                isEdit: true,
                typeId: String(type._id),
                formData: {
                    nombre: type.nombre,
                    descripcion: type.descripcion || "",
                },
                errors: {},
            });
        } catch (error) {
            next(error);
        }
    },

    async postEdit(req, res, next) {
        try {
            const typeId = req.params.id;

            const type = await CommerceType.findById(typeId);
            if (!type) {
                return res.redirect("/admin/tipos-comercios");
            }

            const result = validationResult(req);

            const formData = {
                nombre: req.body.nombre || "",
                descripcion: req.body.descripcion || "",
            };

            const sidebar = buildAdminSidebar("tipos-comercios");

            if (!result.isEmpty()) {
                return res.status(422).render("admin/tipo_comercio_form", {
                    title: "Editar Tipo de Comercio",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    isEdit: true,
                    typeId: String(type._id),
                    formData,
                    errors: result.mapped(),
                });
            }

            type.nombre = formData.nombre.trim();
            type.descripcion = formData.descripcion.trim();
            await type.save();

            res.redirect("/admin/tipos-comercios");
        } catch (error) {
            next(error);
        }
    },

    async getDeleteConfirm(req, res, next) {
        try {
            const typeId = req.params.id;

            const type = await CommerceType.findById(typeId).lean();
            if (!type) {
                return res.redirect("/admin/tipos-comercios");
            }

            const sidebar = buildAdminSidebar("tipos-comercios");

            res.render("admin/tipo_comercio_eliminar", {
                title: "Eliminar Tipo de Comercio",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                typeId: String(type._id),
                nombre: type.nombre,
                descripcion: type.descripcion || "",
            });
        } catch (error) {
            next(error);
        }
    },

    async postDelete(req, res, next) {
        try {
            const typeId = req.params.id;

            await CommerceType.deleteOne({ _id: typeId });

            res.redirect("/admin/tipos-comercios");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { adminTypesController };
