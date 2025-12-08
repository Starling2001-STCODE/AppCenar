const deliveryHomeController = {
  getHome(req, res) {
    res.render("delivery/home", {
      title: "Home Delivery - AppCenar",
    });
  },
};

module.exports = { deliveryHomeController };
