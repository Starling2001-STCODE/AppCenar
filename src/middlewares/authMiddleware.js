function authMiddleware(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }

  if (!req.session.user.activo) {
    return res.redirect("/login");
  }

  next();
}

module.exports = { authMiddleware };
