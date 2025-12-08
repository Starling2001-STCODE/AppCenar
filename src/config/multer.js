const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsUsersDir = path.join(__dirname, "..", "..", "uploads", "users");
const uploadsCommercesDir = path.join(__dirname, "..", "..", "uploads", "commerces");

if (!fs.existsSync(uploadsUsersDir)) {
  fs.mkdirSync(uploadsUsersDir, { recursive: true });
}

if (!fs.existsSync(uploadsCommercesDir)) {
  fs.mkdirSync(uploadsCommercesDir, { recursive: true });
}

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsUsersDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const commerceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsCommercesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});

const uploadUserAvatar = multer({
  storage: userStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const uploadCommerceLogo = multer({
  storage: commerceStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = { uploadUserAvatar, uploadCommerceLogo };
