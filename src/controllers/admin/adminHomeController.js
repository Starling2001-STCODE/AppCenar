const adminHomeController = {
  getDashboard(req, res) {
    res.render("admin/dashboard", {
      title: "Dashboard Admin - AppCenar",
    });
  },
};

module.exports = { adminHomeController };
