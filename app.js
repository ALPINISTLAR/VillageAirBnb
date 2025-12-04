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

// ROUTES (GET)
// HOME PAGE
app.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*,
             (
               SELECT url
               FROM property_images
               WHERE property_id = p.id
               ORDER BY position ASC
               LIMIT 1
             ) AS image_url,
             ARRAY(
               SELECT a.name
               FROM property_amenities pa
               JOIN amenities a ON pa.amenity_id = a.id
               WHERE pa.property_id = p.id
               ORDER BY a.name
             ) AS amenities
      FROM properties p
      ORDER BY p.id DESC
      LIMIT 3;
    `);

    res.render("index", { properties: result.rows, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ALL PROPERTIES
app.get("/properties", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*,
             (
               SELECT url
               FROM property_images
               WHERE property_id = p.id
               ORDER BY position ASC
               LIMIT 1
             ) AS image_url,
             ARRAY(
               SELECT a.name
               FROM property_amenities pa
               JOIN amenities a ON pa.amenity_id = a.id
               WHERE pa.property_id = p.id
               ORDER BY a.name
             ) AS amenities
      FROM properties p
      ORDER BY p.id DESC;
    `);

    res.render("properties", { properties: result.rows, user: req.session.user });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Server error");
  }
});

// SINGLE PROPERTY PAGE
app.get("/property/:id", async (req, res) => {
  const propertyId = req.params.id;

  try {
    const propertyResult = await db.query(
      `
      SELECT p.*,
             ARRAY(
               SELECT url
               FROM property_images
               WHERE property_id = p.id
               ORDER BY position ASC
             ) AS images,
             ARRAY(
               SELECT a.name
               FROM property_amenities pa
               JOIN amenities a ON pa.amenity_id = a.id
               WHERE pa.property_id = p.id
               ORDER BY a.name
             ) AS amenities
      FROM properties p
      WHERE p.id = $1
    `,
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).send("Property not found");
    }

    res.render("property-details", {
      property: propertyResult.rows[0],
      user: req.session.user
    });

  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send("Server error");
  }
});

// LIST ROOM PAGE
app.get("/list-room", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.render("list-room", { user: req.session.user });
});

// PROFILE PAGE
app.get("/profile", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("profile", { user: req.session.user });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
