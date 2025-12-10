const { Product } = require("../../models/Product");
const { Commerce } = require("../../models/Commerce");
const { buildClienteSidebar, SIDEBAR_OFFCANVAS_ID } = require("./clienteHomeController");

const ITBIS_RATE = 0.18;

function getCartFromSession(req) {
  if (!req.session.cart) {
    req.session.cart = { items: [] };
  }
  return req.session.cart;
}

function setCartInSession(req, cart) {
  req.session.cart = cart;
}

const clienteCartController = {
  async addToCart(req, res, next) {
    try {
      const productId = req.params.productId;
      const product = await Product.findById(productId).select("_id").lean();

      if (!product) {
        return res.status(404).json({ ok: false, message: "Producto no encontrado" });
      }

      const cart = getCartFromSession(req);
      const exists = cart.items.includes(String(productId));

      if (!exists) {
        cart.items.push(String(productId));
        setCartInSession(req, cart);
      }

      return res.json({
        ok: true,
        inCart: true,
        itemCount: cart.items.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeFromCart(req, res, next) {
    try {
      const productId = req.params.productId;
      const cart = getCartFromSession(req);

      const updatedItems = cart.items.filter(function (id) {
        return String(id) !== String(productId);
      });

      cart.items = updatedItems;
      setCartInSession(req, cart);

      return res.json({
        ok: true,
        itemCount: cart.items.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCart(req, res, next) {
    try {
      const cart = getCartFromSession(req);

      if (!cart.items.length) {
        const sidebar = buildClienteSidebar("home");

        return res.render("cliente/carrito", {
          title: "Mi carrito - AppCenar",
          sidebar,
          sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
          items: [],
          hasItems: false,
          subtotal: 0,
          itbis: 0,
          total: 0,
          subtotalFormatted: "0.00",
          itbisFormatted: "0.00",
          totalFormatted: "0.00",
        });
      }

      const products = await Product.find({ _id: { $in: cart.items } })
        .populate("comercio", "nombre")
        .sort({ nombre: 1 })
        .lean();

      const items = products.map(function (p) {
        return {
          id: String(p._id),
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          comercioNombre: p.comercio ? p.comercio.nombre : "",
        };
      });

      const subtotal = items.reduce(function (acc, item) {
        return acc + item.precio;
      }, 0);

      const itbis = subtotal * ITBIS_RATE;
      const total = subtotal + itbis;

      const sidebar = buildClienteSidebar("home");

      res.render("cliente/carrito", {
        title: "Mi carrito - AppCenar",
        sidebar,
        sidebarOffcanvasId: SIDEBAR_OFFCANVAS_ID,
        items,
        hasItems: items.length > 0,
        subtotal,
        itbis,
        total,
        subtotalFormatted: subtotal.toFixed(2),
        itbisFormatted: itbis.toFixed(2),
        totalFormatted: total.toFixed(2),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { clienteCartController };
