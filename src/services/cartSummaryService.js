const { Product } = require("../models/Product");
const { getItbisRate } = require("./itbisService");

async function getCartProductsAndSummary(req) {
    const cart = req.session.cart || { items: [] };

    if (!cart.items.length) {
        return null;
    }

    const products = await Product.find({ _id: { $in: cart.items } })
        .populate("comercio", "nombre tipoComercio")
        .sort({ nombre: 1 })
        .lean();

    if (!products.length) {
        return null;
    }

    const subtotal = products.reduce(function (acc, p) {
        return acc + p.precio;
    }, 0);

    const itbisRate = await getItbisRate();
    const itbis = subtotal * itbisRate;
    const total = subtotal + itbis;

    const firstCommerce = products[0].comercio || null;

    const summary = {
        hasItems: true,
        subtotal,
        itbis,
        total,
        subtotalFormatted: subtotal.toFixed(2),
        itbisFormatted: itbis.toFixed(2),
        totalFormatted: total.toFixed(2),
        comercioNombre: firstCommerce ? firstCommerce.nombre : "",
        comercioId: firstCommerce ? String(firstCommerce._id) : null,
    };

    return { products, summary };
}

module.exports = { getCartProductsAndSummary };
