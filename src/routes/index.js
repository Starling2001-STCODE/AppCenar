const express = require("express");
const authRoutes = require("./auth.routes");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { adminHomeController } = require("../controllers/admin/adminHomeController");
const { adminClientsController } = require("../controllers/admin/adminClientsController");
const { adminDeliveryController } = require("../controllers/admin/adminDeliveryController");
const { adminCommercesController } = require("../controllers/admin/adminCommercesController");
const { adminConfigController } = require("../controllers/admin/adminConfigController");
const { adminAdminsController } = require("../controllers/admin/adminAdminsController");
const { createAdminValidator, updateAdminValidator } = require("../validators/adminUserValidators");
const { adminTypesController } = require("../controllers/admin/adminTypesController");
const { commerceTypeValidator } = require("../validators/commerceTypeValidators");
const { itbisValidator } = require("../validators/configValidators");
const { clienteHomeController } = require("../controllers/cliente/clienteHomeController");
const { deliveryHomeController } = require("../controllers/delivery/deliveryHomeController");
const { clienteFavoritesController } = require("../controllers/cliente/clienteFavoritesController");
const { clienteCartController } = require("../controllers/cliente/clienteCartController");
const { clienteCheckoutController } = require("../controllers/cliente/clienteCheckoutController");
const { clienteOrderController } = require("../controllers/cliente/clienteOrderController");
const { clienteProfileController } = require("../controllers/cliente/clienteProfileController");
const { uploadUserAvatar } = require("../config/multer");
const { updateProfileValidator } = require("../validators/clienteProfileValidators");
const { addressValidator } = require("../validators/addressValidators");
const { clienteAddressController } = require("../controllers/cliente/clienteAddressController");
const { comercioHomeController } = require("../controllers/comercio/comercioHomeController");
const { comercioOrderController } = require("../controllers/comercio/comercioOrdersController");
const { comercioCategoryController } = require("../controllers/comercio/comercioCategoryController");
const { createCategoryValidator } = require("../validators/categoryValidators");
const { comercioProductController } = require("../controllers/comercio/comercioProductController");
const { productValidator } = require("../validators/productValidators");

const { uploadCommerceLogo } = require("../config/multer");
const { commerceProfileValidator } = require("../validators/commerceValidators");
const { comercioProfileController } = require("../controllers/comercio/comercioProfileController");
const { deliveryOrdersController } = require("../controllers/delivery/deliveryOrdersController");


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



//RUTAS DE LOS DELIVERY
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

router.get(
  "/delivery/pedidos",
  authMiddleware,
  roleMiddleware("delivery"),
  deliveryOrdersController.listAssigned
);

router.get(
  "/delivery/pedidos/:id",
  authMiddleware,
  roleMiddleware("delivery"),
  deliveryOrdersController.getDetail
);

router.post(
  "/delivery/pedidos/:id/completar",
  authMiddleware,
  roleMiddleware("delivery"),
  deliveryOrdersController.postComplete
);

//RUTAS DE LOS COMERCIO
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

router.get(
  "/comercio/pedidos",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioOrderController.getOrders
);

router.get(
  "/comercio/pedidos/:orderId",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioOrderController.getOrderDetail
);

router.get(
  "/comercio/pedidos/:orderId/asignar-delivery",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioOrderController.getAssignDelivery
);

router.post(
  "/comercio/pedidos/:orderId/asignar-delivery",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioOrderController.postAssignDelivery
);

router.get(
  "/comercio/perfil",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioProfileController.getProfile
);

router.post(
  "/comercio/perfil",
  authMiddleware,
  roleMiddleware("comercio"),
  uploadCommerceLogo.single("logo"),
  commerceProfileValidator,
  comercioProfileController.postProfile
);

router.get(
  "/comercio/categorias",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioCategoryController.list
);

router.get(
  "/comercio/categorias/nueva",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioCategoryController.getCreate
);

router.post(
  "/comercio/categorias/nueva",
  authMiddleware,
  roleMiddleware("comercio"),
  createCategoryValidator,
  comercioCategoryController.postCreate
);

router.get(
  "/comercio/categorias/:id/editar",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioCategoryController.getEdit
);

router.post(
  "/comercio/categorias/:id/editar",
  authMiddleware,
  roleMiddleware("comercio"),
  createCategoryValidator,
  comercioCategoryController.postEdit
);

router.get(
  "/comercio/categorias/:id/eliminar",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioCategoryController.getDeleteConfirm
);

router.post(
  "/comercio/categorias/:id/eliminar",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioCategoryController.postDelete
);

// rutas de productos del comercio

router.get(
  "/comercio/productos",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioProductController.list
);

router.get(
  "/comercio/productos/nuevo",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioProductController.getCreate
);

router.post(
  "/comercio/productos/nuevo",
  authMiddleware,
  roleMiddleware("comercio"),
  productValidator,
  comercioProductController.postCreate
);

router.get(
  "/comercio/productos/:id/editar",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioProductController.getEdit
);

router.post(
  "/comercio/productos/:id/editar",
  authMiddleware,
  roleMiddleware("comercio"),
  productValidator,
  comercioProductController.postEdit
);

router.get(
  "/comercio/productos/:id/eliminar",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioProductController.getDeleteConfirm
);

router.post(
  "/comercio/productos/:id/eliminar",
  authMiddleware,
  roleMiddleware("comercio"),
  comercioProductController.postDelete
);



//RUTAS DE LOS ADMIN
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

router.get(
  "/admin/clientes",
  authMiddleware,
  roleMiddleware("admin"),
  adminClientsController.list
);

router.post(
  "/admin/clientes/:id/toggle-estado",
  authMiddleware,
  roleMiddleware("admin"),
  adminClientsController.toggleStatus
);

router.get(
  "/admin/delivery",
  authMiddleware,
  roleMiddleware("admin"),
  adminDeliveryController.list
);

router.post(
  "/admin/delivery/:id/toggle-estado",
  authMiddleware,
  roleMiddleware("admin"),
  adminDeliveryController.toggleStatus
);

router.get(
  "/admin/comercios",
  authMiddleware,
  roleMiddleware("admin"),
  adminCommercesController.list
);

router.post(
  "/admin/comercios/:id/toggle-estado",
  authMiddleware,
  roleMiddleware("admin"),
  adminCommercesController.toggleStatus
);

router.get(
  "/admin/configuracion",
  authMiddleware,
  roleMiddleware("admin"),
  adminConfigController.getConfig
);

router.post(
  "/admin/configuracion",
  authMiddleware,
  roleMiddleware("admin"),
  itbisValidator,
  adminConfigController.postConfig
);

router.get(
  "/admin/administradores",
  authMiddleware,
  roleMiddleware("admin"),
  adminAdminsController.list
);

router.get(
  "/admin/administradores/nuevo",
  authMiddleware,
  roleMiddleware("admin"),
  adminAdminsController.getCreate
);

router.post(
  "/admin/administradores/nuevo",
  authMiddleware,
  roleMiddleware("admin"),
  createAdminValidator,
  adminAdminsController.postCreate
);

router.get(
  "/admin/administradores/:id/editar",
  authMiddleware,
  roleMiddleware("admin"),
  adminAdminsController.getEdit
);

router.post(
  "/admin/administradores/:id/editar",
  authMiddleware,
  roleMiddleware("admin"),
  updateAdminValidator,
  adminAdminsController.postEdit
);

router.post(
  "/admin/administradores/:id/toggle-estado",
  authMiddleware,
  roleMiddleware("admin"),
  adminAdminsController.toggleStatus
);

router.get(
  "/admin/tipos-comercios",
  authMiddleware,
  roleMiddleware("admin"),
  adminTypesController.list
);

router.get(
  "/admin/tipos-comercios/nuevo",
  authMiddleware,
  roleMiddleware("admin"),
  adminTypesController.getCreate
);

router.post(
  "/admin/tipos-comercios/nuevo",
  authMiddleware,
  roleMiddleware("admin"),
  commerceTypeValidator,
  adminTypesController.postCreate
);

router.get(
  "/admin/tipos-comercios/:id/editar",
  authMiddleware,
  roleMiddleware("admin"),
  adminTypesController.getEdit
);

router.post(
  "/admin/tipos-comercios/:id/editar",
  authMiddleware,
  roleMiddleware("admin"),
  commerceTypeValidator,
  adminTypesController.postEdit
);

router.get(
  "/admin/tipos-comercios/:id/eliminar",
  authMiddleware,
  roleMiddleware("admin"),
  adminTypesController.getDeleteConfirm
);

router.post(
  "/admin/tipos-comercios/:id/eliminar",
  authMiddleware,
  roleMiddleware("admin"),
  adminTypesController.postDelete
);


// RUTAS DE LOS CLIENTES

router.get(
  "/cliente",
  authMiddleware,
  roleMiddleware("cliente"),
  (req, res) => res.redirect("/cliente/home")
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
