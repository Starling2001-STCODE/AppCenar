const path = require("path");
require("dotenv").config();

const express = require("express");
const { engine } = require("express-handlebars");

const { connectDB } = require("./config/db");
const { sessionMiddleware } = require("./config/session");
const routes = require("./routes");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      ifEquals: function (a, b, options) {
        return String(a) === String(b) ? options.fn(this) : options.inverse(this);
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(sessionMiddleware);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AppCenar escuchando en http://localhost:${PORT}`);
});

module.exports = app;
