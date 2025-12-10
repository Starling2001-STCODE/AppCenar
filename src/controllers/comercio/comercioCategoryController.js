const { Category } = require("../../models/Category");
const { Commerce } = require("../../models/Commerce");
const { validationResult } = require("express-validator");
const {
  buildComercioSidebar,
  SIDEBAR_OFFCANVAS_ID,
} = require("./comercioHomeController");

function buildCategoryFormData(body) {
  return {
    nombre: body.nombre || "",
    descripcion: body.descripcion || "",
  };
}

const comercioCategoryController = {
  async list(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const categoriesDocs = await Category.find({ comercio: comercio._id })
        .sort({ nombre: 1 })
        .lean();

      const categories = categoriesDocs.map(function (c) {
        return {
          id: String(c._id),
          nombre: c.nombre,
          descripcion: c.descripcion || "",
          activo: !!c.activo,
          creadoEn: c.createdAt
            ? c.createdAt.toLocaleString("es-DO")
            : "",
        };
      });

      const sidebar = buildComercioSidebar("categorias");

      res.render("comercio/categorias", {
        title: "Categorías del comercio - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        categories,
        hasCategories: categories.length > 0,
      });
    } catch (error) {
      next(error);
    }
    },

  async getCreate(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const sidebar = buildComercioSidebar("categorias");
      const formData = buildCategoryFormData({});

      res.render("comercio/categoria_nueva", {
        title: "Nueva categoría - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        formData,
        errors: {},
      });
    } catch (error) {
      next(error);
    }
    },

  async postCreate(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const result = validationResult(req);
      const sidebar = buildComercioSidebar("categorias");
      const formData = buildCategoryFormData(req.body);

      if (!result.isEmpty()) {
        return res.status(422).render("comercio/categoria_nueva", {
          title: "Nueva categoría - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioNombre: comercio.nombre,
          comercioLogo: comercio.logo,
          formData,
          errors: result.mapped(),
        });
      }

      await Category.create({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        comercio: comercio._id,
        activo: true,
      });

      res.redirect("/comercio/categorias");
    } catch (error) {
      next(error);
    }
    },
    
  async getEdit(req, res, next) {
  try {
    const userId = req.session.user.id;
    const categoryId = req.params.id;

    const comercio = await Commerce.findOne({ usuario: userId })
      .select("_id nombre logo")
      .lean();

    if (!comercio) return res.redirect("/");

    const category = await Category.findOne({
      _id: categoryId,
      comercio: comercio._id,
    }).lean();

    if (!category) return res.redirect("/comercio/categorias");

    const sidebar = buildComercioSidebar("categorias");

    const formData = {
      nombre: category.nombre,
      descripcion: category.descripcion || "",
    };

    res.render("comercio/categoria_editar", {
      title: "Editar categoría - AppCenar",
      sidebar,
      sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
      comercioNombre: comercio.nombre,
      comercioLogo: comercio.logo,
      formData,
      errors: {},
      categoryId: String(category._id),
    });
  } catch (error) {
    next(error);
  }
    },

    async postEdit(req, res, next) {
    try {
        const userId = req.session.user.id;
        const categoryId = req.params.id;

        const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();
        if (!comercio) return res.redirect("/");

        const category = await Category.findOne({
        _id: categoryId,
        comercio: comercio._id,
        });

        if (!category) return res.redirect("/comercio/categorias");

        const result = validationResult(req);
        const sidebar = buildComercioSidebar("categorias");

        const formData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        };

        if (!result.isEmpty()) {
        return res.status(422).render("comercio/categoria_editar", {
            title: "Editar categoría - AppCenar",
            sidebar,
            sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
            comercioNombre: comercio.nombre,
            comercioLogo: comercio.logo,
            formData,
            errors: result.mapped(),
            categoryId: String(category._id),
        });
        }

        category.nombre = formData.nombre.trim();
        category.descripcion = formData.descripcion.trim();
        await category.save();

        res.redirect("/comercio/categorias");
    } catch (error) {
        next(error);
    }
    },

    async getDeleteConfirm(req, res, next) {
    try {
        const userId = req.session.user.id;
        const categoryId = req.params.id;

        const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

        if (!comercio) {
        return res.redirect("/");
        }

        const category = await Category.findOne({
        _id: categoryId,
        comercio: comercio._id,
        }).lean();

        if (!category) {
        return res.redirect("/comercio/categorias");
        }

        const sidebar = buildComercioSidebar("categorias");

        res.render("comercio/categoria_eliminar", {
        title: "Eliminar categoría - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        categoryId: String(category._id),
        categoryNombre: category.nombre,
        categoryDescripcion: category.descripcion || "",
        });
    } catch (error) {
        next(error);
    }
    },

    async postDelete(req, res, next) {
    try {
        const userId = req.session.user.id;
        const categoryId = req.params.id;

        const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id")
        .lean();

        if (!comercio) {
        return res.redirect("/");
        }

        const category = await Category.findOne({
        _id: categoryId,
        comercio: comercio._id,
        }).lean();

        if (!category) {
        return res.redirect("/comercio/categorias");
        }

        await Category.deleteOne({
        _id: categoryId,
        comercio: comercio._id,
        });

        res.redirect("/comercio/categorias");
    } catch (error) {
        next(error);
    }
    },


};

module.exports = { comercioCategoryController };
