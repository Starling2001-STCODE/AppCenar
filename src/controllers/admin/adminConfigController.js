const { validationResult } = require("express-validator");
const { Setting } = require("../../models/Setting");
const { buildAdminSidebar, SIDEBAR_OFFCANVAS_ID } = require("./adminHomeController");

const ITBIS_KEY = "itbis";

const adminConfigController = {
    async getConfig(req, res, next) {
        try {
            const setting = await Setting.findOne({ key: ITBIS_KEY }).lean();

            const itbisValue = setting ? setting.value : "18";

            const sidebar = buildAdminSidebar("configuracion");

            res.render("admin/configuracion", {
                title: "Configuración - Admin - AppCenar",
                sidebar,
                sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                formData: {
                    itbis: itbisValue,
                },
                errors: {},
            });
        } catch (error) {
            next(error);
        }
    },

    async postConfig(req, res, next) {
        try {
            const result = validationResult(req);

            const formData = {
                itbis: req.body.itbis || "",
            };

            const sidebar = buildAdminSidebar("configuracion");

            if (!result.isEmpty()) {
                return res.status(422).render("admin/configuracion", {
                    title: "Configuración - Admin - AppCenar",
                    sidebar,
                    sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
                    formData,
                    errors: result.mapped(),
                });
            }

            const itbisValue = String(formData.itbis).trim();

            await Setting.findOneAndUpdate(
                { key: ITBIS_KEY },
                { value: itbisValue },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            res.redirect("/admin/configuracion");
        } catch (error) {
            next(error);
        }
    },
};

module.exports = { adminConfigController };
