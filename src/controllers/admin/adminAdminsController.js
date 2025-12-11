const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { User } = require("../../models/User");
const { buildAdminSidebar, SIDEBAR_OFFCANVAS_ID } = require("./adminHomeController");

const adminAdminsController = {
    async list(req, res, next) {
        try {
            const admins = await User.find({ rol: "admin" }).lean();

            const administradores = admins.map((a) => ({
                id: String(a._id),
                nombre: a.nombre || "",
                apellido: a.apellido || "",
                nombreCompleto: ((a.nombre || "") + " " + (a.apellido || "")).trim(),
                telefono: a.telefono || "",
                email: a.email || "",
                activo: !!a.activo,
            }));

            const sidebar = buildAdminSidebar("administradores");

            res.render("admin/administradores", {
                title: "Administradores - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                administradores,
                hasAdministradores: administradores.length > 0,
            });
        } catch (error) {
            next(error);
        }
    },

    async getCreate(req, res, next) {
        try {
            const sidebar = buildAdminSidebar("administradores");

            res.render("admin/administrador_form", {
                title: "Nuevo administrador - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                isEdit: false,
                adminId: null,
                formData: {
                    nombre: "",
                    apellido: "",
                    telefono: "",
                    email: "",
                    password: "",
                },
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
                apellido: req.body.apellido || "",
                telefono: req.body.telefono || "",
                email: req.body.email || "",
                password: req.body.password || "",
            };

            const sidebar = buildAdminSidebar("administradores");

            if (!result.isEmpty()) {
                return res.status(422).render("admin/administrador_form", {
                    title: "Nuevo administrador - Admin - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    isEdit: false,
                    adminId: null,
                    formData,
                    errors: result.mapped(),
                });
            }

            const normalizedEmail = formData.email.trim().toLowerCase();
            const passwordHash = bcrypt.hashSync(formData.password, 10);

            await User.create({
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                telefono: formData.telefono.trim(),
                email: normalizedEmail,
                username: normalizedEmail,
                passwordHash,
                rol: "admin",
                activo: true,
            });

            res.redirect("/admin/administradores");
        } catch (error) {
            next(error);
        }
    },

    async getEdit(req, res, next) {
        try {
            const adminId = req.params.id;

            const admin = await User.findOne({ _id: adminId, rol: "admin" }).lean();
            if (!admin) return res.redirect("/admin/administradores");

            const sidebar = buildAdminSidebar("administradores");

            res.render("admin/administrador_form", {
                title: "Editar administrador - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                isEdit: true,
                adminId: String(admin._id),
                formData: {
                    nombre: admin.nombre || "",
                    apellido: admin.apellido || "",
                    telefono: admin.telefono || "",
                    email: admin.email || "",
                    password: "",
                },
                errors: {},
            });
        } catch (error) {
            next(error);
        }
    },

    async postEdit(req, res, next) {
        try {
            const adminId = req.params.id;

            const admin = await User.findOne({ _id: adminId, rol: "admin" });
            if (!admin) return res.redirect("/admin/administradores");

            const result = validationResult(req);

            const formData = {
                nombre: req.body.nombre || "",
                apellido: req.body.apellido || "",
                telefono: req.body.telefono || "",
                email: req.body.email || "",
                password: req.body.password || "",
            };

            const sidebar = buildAdminSidebar("administradores");

            if (!result.isEmpty()) {
                return res.status(422).render("admin/administrador_form", {
                    title: "Editar administrador - Admin - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    isEdit: true,
                    adminId: String(admin._id),
                    formData,
                    errors: result.mapped(),
                });
            }

            const normalizedEmail = formData.email.trim().toLowerCase();

            admin.nombre = formData.nombre.trim();
            admin.apellido = formData.apellido.trim();
            admin.telefono = formData.telefono.trim();
            admin.email = normalizedEmail;
            admin.username = normalizedEmail;

            if (formData.password && formData.password.trim().length > 0) {
                const passwordHash = bcrypt.hashSync(formData.password, 10);
                admin.passwordHash = passwordHash;
            }

            await admin.save();

            res.redirect("/admin/administradores");
        } catch (error) {
            next(error);
        }
    },

    async toggleStatus(req, res, next) {
        try {
            const adminId = req.params.id;

            const admin = await User.findOne({ _id: adminId, rol: "admin" });
            if (!admin) return res.redirect("/admin/administradores");

            admin.activo = !admin.activo;
            await admin.save();

            res.redirect("/admin/administradores");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { adminAdminsController };
