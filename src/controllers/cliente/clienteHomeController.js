const clienteHomeController = {
  getHome(req, res) {
    res.render("cliente/home", {
      title: "Home Cliente - AppCenar",
    });
  },
};

module.exports = { clienteHomeController };
