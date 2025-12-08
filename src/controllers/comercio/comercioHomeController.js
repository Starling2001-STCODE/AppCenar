const comercioHomeController = {
  getHome(req, res) {
    res.render("comercio/home", {
      title: "Home Comercio - AppCenar",
    });
  },
};

module.exports = { comercioHomeController };
