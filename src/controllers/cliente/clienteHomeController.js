const { CommerceType } = require("../../models/CommerceType");
const { Commerce } = require("../../models/Commerce");
const { User } = require("../../models/User");
const { Product } = require("../../models/Product");

const SIDEBAR_OFFCANVAS_ID = "clienteSidebarOffcanvas";

function buildClienteSidebar(activeKey) {
  return {
    title: "Menú del Cliente",
    items: [
      { href: "/cliente/home", label: "Inicio", icon: "bi bi-house", active: activeKey === "home" },
      { href: "/cliente/perfil", label: "Perfil", icon: "bi bi-person", active: activeKey === "perfil" },
      { href: "/cliente/pedidos", label: "Pedidos", icon: "bi bi-receipt", active: activeKey === "pedidos" },
      { href: "/cliente/direcciones", label: "Direcciones", icon: "bi bi-geo-alt", active: activeKey === "direcciones" },
      { href: "/cliente/favoritos", label: "Favoritos", icon: "bi bi-heart", active: activeKey === "favoritos" },
      { href: "/logout", label: "Cerrar sesión", icon: "bi bi-box-arrow-right", danger: true },
    ],
  };
}

const clienteHomeController = {
  async getHome(req, res, next) {
    try {
      const tiposComercio = await CommerceType.find({ activo: true })
        .sort({ nombre: 1 })
        .lean();

      const sidebar = buildClienteSidebar("home");

      res.render("cliente/home", {
        title: "Home Cliente - AppCenar",
        tiposComercio,
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCommercesByType(req, res, next) {
    try {
      const tipoId = req.params.tipoId;
      const search = (req.query.q || "").trim();

      const tipoComercio = await CommerceType.findById(tipoId).lean();
      if (!tipoComercio) {
        return res.redirect("/cliente/home");
      }

      const filter = { tipoComercio: tipoId };

      if (search) {
        filter.nombre = { $regex: search, $options: "i" };
      }

      const user = await User.findById(req.session.user.id)
        .select("favoritos")
        .lean();

      const favoritosIds =
        user && user.favoritos
          ? user.favoritos.map(function (id) {
              return String(id);
            })
          : [];

      const comerciosBase = await Commerce.find(filter)
        .sort({ nombre: 1 })
        .lean();

      const comercios = comerciosBase.map(function (c) {
        return Object.assign({}, c, {
          isFavorite: favoritosIds.includes(String(c._id)),
        });
      });

      const sidebar = buildClienteSidebar("home");
      const totalComercios = comercios.length;

      res.render("cliente/commerces_by_type", {
        title: `Comercios de ${tipoComercio.nombre} - AppCenar`,
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        tipoComercio,
        comercios,
        search,
        totalComercios,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCommerceCatalog(req, res, next) {
    try {
      const commerceId = req.params.commerceId;

      const comercio = await Commerce.findById(commerceId).lean();
      if (!comercio) {
        return res.redirect("/cliente/home");
      }

      const productos = await Product.find({
        comercio: commerceId,
        activo: true,
      })
        .sort({ categoria: 1, nombre: 1 })
        .lean();

      const categoriasMap = {};
      productos.forEach(function (p) {
        const key = p.categoria || "Otros";
        if (!categoriasMap[key]) {
          categoriasMap[key] = [];
        }
        categoriasMap[key].push(p);
      });

      const categorias = Object.keys(categoriasMap).map(function (nombre) {
        return {
          nombre,
          productos: categoriasMap[nombre],
        };
      });

      const sidebar = buildClienteSidebar("home");

      res.render("cliente/catalogo", {
        title: `Catálogo de ${comercio.nombre} - AppCenar`,
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        comercio,
        categorias,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = {
  clienteHomeController,
  buildClienteSidebar,
  SIDEBAR_OFFCANVAS_ID,
};
