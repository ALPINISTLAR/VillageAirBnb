// BASIC SETUP
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const FormData = require('form-data');
const axios = require('axios');

const app = express();
const db = require("./models/db");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
  session({
    secret: "very-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MULTER CONFIGURATION (Memory storage for ImgBB)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); // Temporary folder
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

// ImgBB Upload Function
async function uploadToImgBB(filePath) {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    if (response.data && response.data.data) {
      return response.data.data.url;
    }

    throw new Error('ImgBB upload failed');
  } catch (error) {
    console.error('ImgBB Error:', error.message);
    throw error;
  }
}

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

    const properties = result.rows.map(p => ({
      ...p,
      relative_date: dayjs(p.created_at).fromNow()
    }));

    res.render("index", { properties, user: req.session.user });
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

        const properties = result.rows.map(p => ({
  ...p,
  relative_date: dayjs(p.created_at).fromNow()
}));

res.render("properties", { properties, user: req.session.user });
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

// PROPERTY MANAGEMENT (POST)
// CREATE PROPERTY
app.post('/api/properties', upload.array('images', 10), async (req, res) => {

  try {
    if (!req.session.user) {
      console.log('ERROR: User not logged in');
      return res.status(401).send('Please login first');
    }

    const {
      propertyName,
      region,
      city,
      address,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      description,
      amenities
    } = req.body;

    const userId = req.session.user.id;

    //  save propety in databse
    const propertyResult = await db.query(`
      INSERT INTO properties (
        host_id, title, region, city, address,
        price_per_night, capacity, bedrooms, bathrooms, description, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id
    `, [userId, propertyName, region, city, address, pricePerNight, maxGuests, bedrooms, bathrooms, description]);

    const propertyId = propertyResult.rows[0].id;


// save images to ImgBB
if (req.files && req.files.length > 0) {
  console.log('Uploading images to ImgBB...');

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    const localPath = file.path;

    try {
      // Upload to ImgBB
      const imgbbUrl = await uploadToImgBB(localPath);
      console.log(`Image ${i + 1} uploaded to ImgBB:`, imgbbUrl);

      // Save to database
      await db.query(`
        INSERT INTO property_images (property_id, url, position)
        VALUES ($1, $2, $3)
      `, [propertyId, imgbbUrl, i]);

      // Delete local file (no longer needed)
      fs.unlinkSync(localPath);

    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error.message);
    }
  }
}

    // save amenities
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];

      for (let amenityName of amenitiesArray) {
        const amenityResult = await db.query(`
          SELECT id FROM amenities WHERE name = $1
        `, [amenityName]);

        if (amenityResult.rows.length > 0) {
          await db.query(`
            INSERT INTO property_amenities (property_id, amenity_id)
            VALUES ($1, $2)
          `, [propertyId, amenityResult.rows[0].id]);
        } else {
          const newAmenity = await db.query(`
            INSERT INTO amenities (name)
            VALUES ($1)
            RETURNING id
          `, [amenityName]);

          await db.query(`
            INSERT INTO property_amenities (property_id, amenity_id)
            VALUES ($1, $2)
          `, [propertyId, newAmenity.rows[0].id]);
        }
      }
    }

    res.redirect('/?success=true');

  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).send('Error creating property: ' + err.message);
  }
});

// AUTHENTICATION
// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.send("Email already registered!");
    }

    let role_id = 1;
    if (role === "host") role_id = 2;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query(
      `
      INSERT INTO users(name, email, password, role_id, created_at)
      VALUES($1, $2, $3, $4, NOW())
      RETURNING id, name, email, role_id;
      `,
      [name, email, hashedPassword, role_id]
    );

    req.session.user = {
      id: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role_id
    };

    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).send("Signup error");
  }
});

// SIGN-IN
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.send("User not found");
    }

    const user = userResult.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send("Incorrect password");
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_id
    };

    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).send("Signin error");
  }
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect("/");
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);