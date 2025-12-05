const session = require("express-session");

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "appcenar_super_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2,
  },
});

module.exports = { sessionMiddleware };
