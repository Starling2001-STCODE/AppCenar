const express = require("express");
const authRoutes = require("./auth.routes");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use("/", authRoutes);

router.get("/cliente/home", authMiddleware, (req, res) => {
  res.send("Home Cliente AppCenar");
});

router.get("/comercio/home", authMiddleware, (req, res) => {
  res.send("Home Comercio AppCenar");
});

router.get("/delivery/home", authMiddleware, (req, res) => {
  res.send("Home Delivery AppCenar");
});

router.get("/admin/dashboard", authMiddleware, (req, res) => {
  res.send("Dashboard Admin AppCenar");
});

module.exports = router;
