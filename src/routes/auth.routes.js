const express = require("express");
const {
  loginValidator,
  registerClientDeliveryValidator,
  registerCommerceValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidators");
const { uploadUserAvatar, uploadCommerceLogo } = require("../config/multer");
const { authController } = require("../controllers/authController");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", loginValidator, authController.postLogin);

router.get("/register/cliente", authController.getRegisterCliente);
router.get("/register/delivery", authController.getRegisterDelivery);

router.post(
  "/register/cliente",
  uploadUserAvatar.single("avatar"),
  registerClientDeliveryValidator,
  authController.postRegisterCliente
);

router.post(
  "/register/delivery",
  uploadUserAvatar.single("avatar"),
  registerClientDeliveryValidator,
  authController.postRegisterDelivery
);

router.get("/register/comercio", authController.getRegisterComercio);

router.post(
  "/register/comercio",
  uploadCommerceLogo.single("logo"),
  registerCommerceValidator,
  authController.postRegisterComercio
);

router.get("/activate/:token", authController.getActivate);

router.get("/password/forgot", authController.getForgotPassword);
router.post(
  "/password/forgot",
  forgotPasswordValidator,
  authController.postForgotPassword
);

router.get("/password/reset/:token", authController.getResetPassword);
router.post(
  "/password/reset/:token",
  resetPasswordValidator,
  authController.postResetPassword
);

//
router.get('/logout', (req, res, next) => {

    req.session.destroy(err => {
        if (err) {
            console.error("Error al cerrar la sesión:", err);
            return next(err);
        }

        res.clearCookie('connect.sid'); 

        res.redirect('/');
    });
});
//

module.exports = router;
