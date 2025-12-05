function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    const { rol } = req.session.user;

    if (!allowedRoles.includes(rol)) {
      return res.status(403).send("No tienes permisos para acceder a esta sección.");
    }

    next();
  };
}

module.exports = { roleMiddleware };
