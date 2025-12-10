const express = require("express");
const authRoutes = require("./auth.routes");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { adminHomeController } = require("../controllers/admin/adminHomeController");
const { clienteHomeController } = require("../controllers/cliente/clienteHomeController");
const { deliveryHomeController } = require("../controllers/delivery/deliveryHomeController");
const { comercioHomeController } = require("../controllers/comercio/comercioHomeController");
const { clienteFavoritesController } = require("../controllers/cliente/clienteFavoritesController");
const { clienteCartController } = require("../controllers/cliente/clienteCartController");
const { clienteCheckoutController } = require("../controllers/cliente/clienteCheckoutController");
const { clienteOrderController } = require("../controllers/cliente/clienteOrderController");
const { clienteProfileController } = require("../controllers/cliente/clienteProfileController");
const { uploadUserAvatar } = require("../config/multer");
const { updateProfileValidator } = require("../validators/clienteProfileValidators");
const { addressValidator } = require("../validators/addressValidators");
const { clienteAddressController } = require("../controllers/cliente/clienteAddressController");



const router = express.Router();

function getRedirectPathByRole(rol) {
  if (rol === "cliente") return "/cliente/home";
  if (rol === "comercio") return "/comercio/home";
  if (rol === "delivery") return "/delivery/home";
  if (rol === "admin") return "/admin/dashboard";
  return "/login";
}

router.get("/", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.activo) {
    return res.redirect("/login");
  }

  const redirectTo = getRedirectPathByRole(req.session.user.rol);
  return res.redirect(redirectTo);
});

router.use("/", authRoutes);

// CLIENTE
router.get(
  "/cliente",
  authMiddleware,
  roleMiddleware("cliente"),
  (req, res) => res.redirect("/cliente/home")
);

router.get(
  "/cliente/home",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteHomeController.getHome
);

router.get(
  "/cliente/comercios/:tipoId",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteHomeController.getCommercesByType
);

// DELIVERY
router.get(
  "/delivery",
  authMiddleware,
  roleMiddleware("delivery"),
  (req, res) => res.redirect("/delivery/home")
);

router.get(
  "/delivery/home",
  authMiddleware,
  roleMiddleware("delivery"),
  deliveryHomeController.getHome
);

// COMERCIO
router.get(
  "/comercio",
  authMiddleware,
  roleMiddleware("comercio"),
  (req, res) => res.redirect("/comercio/home")
);

router.get(
  "/comercio/home",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioHomeController.getHome
);

// ADMIN
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => res.redirect("/admin/dashboard")
);

router.get(
  "/admin/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  adminHomeController.getDashboard
);

// CLIENTE FAVORITOS COMERCIOS

router.get(
  "/cliente/favoritos",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteFavoritesController.listFavorites
);

router.post(
  "/cliente/favoritos/:commerceId/toggle",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteFavoritesController.toggleFavorite
);

// GET CATALOGO COMERCIO
router.get(
  "/cliente/comercios/:commerceId/catalogo",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteHomeController.getCommerceCatalog
);

// CLIENTE CARRITO
router.get(
  "/cliente/carrito",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteCartController.getCart
);

router.post(
  "/cliente/carrito/agregar/:productId",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteCartController.addToCart
);

router.post(
  "/cliente/carrito/eliminar/:productId",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteCartController.removeFromCart
);

// CLIENTE DIRECCION
router.get(
  "/cliente/checkout/direccion",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteCheckoutController.selectAddress
);

router.post(
  "/cliente/checkout/direccion/nueva",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteCheckoutController.createAddressFromCheckout
);

//CLIENTE CHECKOUT CONFIRMAR
router.post(
  "/cliente/checkout/confirmar",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteOrderController.createOrder
);

// GET CLIENTE PEDIDOS
router.get(
  "/cliente/pedidos",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteOrderController.getMyOrders
);

// CLIENTE PROFILE

router.get(
  "/cliente/perfil",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteProfileController.getProfile
);

router.post(
  "/cliente/perfil",
  authMiddleware,
  roleMiddleware("cliente"),
  uploadUserAvatar.single("avatar"),
  updateProfileValidator,
  clienteProfileController.postUpdateProfile
);

router.get(
  "/cliente/pedidos/:orderId",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteOrderController.getOrderDetail
);

// CLIENTE CRUD DIRECCIONES 
router.get(
  "/cliente/direcciones",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteAddressController.listAddresses
);

router.post(
  "/cliente/direcciones",
  authMiddleware,
  roleMiddleware("cliente"),
  addressValidator,
  clienteAddressController.createAddress
);

router.get(
  "/cliente/direcciones/:addressId/editar",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteAddressController.getEditAddress
);

router.post(
  "/cliente/direcciones/:addressId/editar",
  authMiddleware,
  roleMiddleware("cliente"),
  addressValidator,
  clienteAddressController.updateAddress
);

router.post(
  "/cliente/direcciones/:addressId/eliminar",
  authMiddleware,
  roleMiddleware("cliente"),
  clienteAddressController.deleteAddress
);




module.exports = router;
