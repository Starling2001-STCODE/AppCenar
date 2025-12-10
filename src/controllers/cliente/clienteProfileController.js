const { validationResult } = require("express-validator");
const { User } = require("../../models/User");
const { buildClienteSidebar, SIDEBAR_OFFCANVAS_ID } = require("./clienteHomeController");

function buildProfileDataFromUser(user) {
    return {
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        telefono: user.telefono || "",
        email: user.email || "",
        avatar: user.avatar || null,
    };
}

function buildProfileDataFromBody(body, currentAvatar, currentEmail) {
    return {
        nombre: body.nombre || "",
        apellido: body.apellido || "",
        telefono: body.telefono || "",
        email: currentEmail || "",
        avatar: currentAvatar || null,
    };
}

const clienteProfileController = {
    async getProfile(req, res, next) {
        try {
            const userId = req.session.user.id;
            const user = await User.findById(userId).lean();

            if (!user) {
                return res.redirect("/login");
            }

            const sidebar = buildClienteSidebar("perfil");
            const profile = buildProfileDataFromUser(user);

            res.render("cliente/perfil", {
                title: "Mi perfil - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                profile,
                errors: {},
                successMessage: null,
            });
        } catch (error) {
            next(error);
        }
    },

    async postUpdateProfile(req, res, next) {
        try {
            const userId = req.session.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.redirect("/login");
            }

            const result = validationResult(req);
            const profileFromBody = buildProfileDataFromBody(
                req.body,
                user.avatar,
                user.email
            );

            if (!result.isEmpty()) {
                const sidebar = buildClienteSidebar("perfil");

                return res.status(422).render("cliente/perfil", {
                    title: "Mi perfil - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    profile: profileFromBody,
                    errors: result.mapped(),
                    successMessage: null,
                });
            }

            let avatarPath = user.avatar || null;

            if (req.file) {
                const relativePath = req.file.path.split("uploads")[1];
                avatarPath = "/uploads" + relativePath.replace(/\\/g, "/");
            }

            user.nombre = profileFromBody.nombre.trim();
            user.apellido = profileFromBody.apellido.trim();
            user.telefono = profileFromBody.telefono.trim();
            user.avatar = avatarPath;

            await user.save();

            if (req.session.user) {
                req.session.user.nombre = user.nombre;
            }

            const sidebar = buildClienteSidebar("perfil");
            const profile = buildProfileDataFromUser(user);

            res.render("cliente/perfil", {
                title: "Mi perfil - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                profile,
                errors: {},
                successMessage: "Perfil actualizado correctamente.",
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { clienteProfileController };
