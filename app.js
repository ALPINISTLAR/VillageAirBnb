// BASIC SETUP
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Static files (css, js, img)
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MULTER CONFIGURATION
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

app.get("/list-room", (req, res) => {
  res.render("list-room");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
