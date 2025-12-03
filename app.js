const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Static files (css, js, img)
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/properties", (req, res) => {
  res.render("properties");
});

app.get("/property", (req, res) => {
  res.render("property-details", { id: null });
});


app.get("/list-room", (req, res) => {
  res.render("list-room");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
