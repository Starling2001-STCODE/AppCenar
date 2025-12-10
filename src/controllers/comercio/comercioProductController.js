const { validationResult } = require("express-validator");
const { Product } = require("../../models/Product");
const { Category } = require("../../models/Category");
const { Commerce } = require("../../models/Commerce");
const {
  buildComercioSidebar,
  SIDEBAR_OFFCANVAS_ID,
} = require("./comercioHomeController");

function buildProductFormData(body, product) {
  return {
    nombre: body.nombre || (product ? product.nombre : ""),
    descripcion: body.descripcion || (product ? product.descripcion : ""),
    precio:
      body.precio != null && body.precio !== ""
        ? body.precio
        : product
        ? product.precio
        : "",
    // aquí guardamos/mostramos el NOMBRE de la categoría
    categoriaId:
      body.categoriaId || (product ? product.categoria || "" : ""),
    imagen: body.imagen || (product ? product.imagen : ""),
  };
}

function mapCategoriesOptions(categoriesDocs, selectedName) {
  const selectedStr = selectedName ? String(selectedName) : "";
  return categoriesDocs.map(function (c) {
    return {
      id: c.nombre, // el value del <option> será el nombre
      nombre: c.nombre,
      selected: c.nombre === selectedStr,
    };
  });
}

const comercioProductController = {
  async list(req, res, next) {
    try {
      const userId = req.session.user.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const productsDocs = await Product.find({ comercio: comercio._id })
        .sort({ nombre: 1 })
        .lean();

      const products = productsDocs.map(function (p) {
        return {
          id: String(p._id),
          nombre: p.nombre,
          descripcion: p.descripcion || "",
          precioFormatted:
            p.precio != null ? p.precio.toFixed(2) : "0.00",
          categoriaNombre: p.categoria || "Sin categoría",
          imagen: p.imagen || null,
          activo: !!p.activo,
          creadoEn: p.createdAt
            ? p.createdAt.toLocaleString("es-DO")
            : "",
        };
      });

      const sidebar = buildComercioSidebar("productos");

      res.render("comercio/productos", {
        title: "Productos del comercio - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        products,
        hasProducts: products.length > 0,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCreate(req, res, next) {
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

      const categoriesOptions = mapCategoriesOptions(categoriesDocs, null);
      const sidebar = buildComercioSidebar("productos");
      const formData = buildProductFormData({}, null);

      res.render("comercio/producto_nuevo", {
        title: "Nuevo producto - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        formData,
        categories: categoriesOptions,
        hasCategories: categoriesOptions.length > 0,
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

      const categoriesDocs = await Category.find({ comercio: comercio._id })
        .sort({ nombre: 1 })
        .lean();

      const result = validationResult(req);
      const sidebar = buildComercioSidebar("productos");
      const formData = buildProductFormData(req.body, null);
      const categoriesOptions = mapCategoriesOptions(
        categoriesDocs,
        formData.categoriaId
      );

      if (!result.isEmpty()) {
        return res.status(422).render("comercio/producto_nuevo", {
          title: "Nuevo producto - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioNombre: comercio.nombre,
          comercioLogo: comercio.logo,
          formData,
          categories: categoriesOptions,
          hasCategories: categoriesOptions.length > 0,
          errors: result.mapped(),
        });
      }

      if (!categoriesOptions.length) {
        return res.status(422).render("comercio/producto_nuevo", {
          title: "Nuevo producto - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioNombre: comercio.nombre,
          comercioLogo: comercio.logo,
          formData,
          categories: categoriesOptions,
          hasCategories: false,
          errors: {
            categoriaId: {
              msg: "Debes crear al menos una categoría antes de crear productos.",
            },
          },
        });
      }

      const imagenValue = formData.imagen ? formData.imagen.trim() : null;

      await Product.create({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        categoria: formData.categoriaId.trim(), // guardamos el NOMBRE
        imagen: imagenValue,
        comercio: comercio._id,
        activo: true,
      });

      res.redirect("/comercio/productos");
    } catch (error) {
      next(error);
    }
  },

  async getEdit(req, res, next) {
    try {
      const userId = req.session.user.id;
      const productId = req.params.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const product = await Product.findOne({
        _id: productId,
        comercio: comercio._id,
      }).lean();

      if (!product) {
        return res.redirect("/comercio/productos");
      }

      const categoriesDocs = await Category.find({ comercio: comercio._id })
        .sort({ nombre: 1 })
        .lean();

      const formData = buildProductFormData({}, product);
      const categoriesOptions = mapCategoriesOptions(
        categoriesDocs,
        formData.categoriaId
      );

      const sidebar = buildComercioSidebar("productos");

      res.render("comercio/producto_editar", {
        title: "Editar producto - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        productId: String(product._id),
        formData,
        categories: categoriesOptions,
        hasCategories: categoriesOptions.length > 0,
        errors: {},
      });
    } catch (error) {
      next(error);
    }
  },

  async postEdit(req, res, next) {
    try {
      const userId = req.session.user.id;
      const productId = req.params.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const product = await Product.findOne({
        _id: productId,
        comercio: comercio._id,
      });

      if (!product) {
        return res.redirect("/comercio/productos");
      }

      const categoriesDocs = await Category.find({ comercio: comercio._id })
        .sort({ nombre: 1 })
        .lean();

      const result = validationResult(req);
      const sidebar = buildComercioSidebar("productos");
      const formData = buildProductFormData(req.body, product);
      const categoriesOptions = mapCategoriesOptions(
        categoriesDocs,
        formData.categoriaId
      );

      if (!result.isEmpty()) {
        return res.status(422).render("comercio/producto_editar", {
          title: "Editar producto - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          comercioNombre: comercio.nombre,
          comercioLogo: comercio.logo,
          productId: String(product._id),
          formData,
          categories: categoriesOptions,
          hasCategories: categoriesOptions.length > 0,
          errors: result.mapped(),
        });
      }

      product.nombre = formData.nombre.trim();
      product.descripcion = formData.descripcion.trim();
      product.precio = parseFloat(formData.precio);
      product.categoria = formData.categoriaId.trim(); // nombre
      product.imagen = formData.imagen ? formData.imagen.trim() : null;

      await product.save();

      res.redirect("/comercio/productos");
    } catch (error) {
      next(error);
    }
  },

  async getDeleteConfirm(req, res, next) {
    try {
      const userId = req.session.user.id;
      const productId = req.params.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id nombre logo")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const product = await Product.findOne({
        _id: productId,
        comercio: comercio._id,
      }).lean();

      if (!product) {
        return res.redirect("/comercio/productos");
      }

      const sidebar = buildComercioSidebar("productos");

      res.render("comercio/producto_eliminar", {
        title: "Eliminar producto - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercioNombre: comercio.nombre,
        comercioLogo: comercio.logo,
        productId: String(product._id),
        nombre: product.nombre,
        categoriaNombre: product.categoria || "Sin categoría",
        precioFormatted:
          product.precio != null ? product.precio.toFixed(2) : "0.00",
        imagen: product.imagen || null,
      });
    } catch (error) {
      next(error);
    }
  },

  async postDelete(req, res, next) {
    try {
      const userId = req.session.user.id;
      const productId = req.params.id;

      const comercio = await Commerce.findOne({ usuario: userId })
        .select("_id")
        .lean();

      if (!comercio) {
        return res.redirect("/");
      }

      const product = await Product.findOne({
        _id: productId,
        comercio: comercio._id,
      }).lean();

      if (!product) {
        return res.redirect("/comercio/productos");
      }

      await Product.deleteOne({
        _id: productId,
        comercio: comercio._id,
      });

      res.redirect("/comercio/productos");
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { comercioProductController };
