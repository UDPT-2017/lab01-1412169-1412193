var express = require("express");
var bodyparser = require("body-parser");
var app = express();

var urlencodeParser = bodyparser.urlencoded({extended:true});

// Template engine
app.set("view engine", "ejs");
app.set("views", "./views");

// build middle ware
app.use(urlencodeParser);
app.use(express.static(__dirname + "/public")); // dinh nghia file css, ....

// setup all route
  // Home Page
app.get("/", function (req, res) {
  res.render("Home");
});

// About Page
app.get("/About", function (req, res) {
  res.render("About");
});

//  Blogs Page
app.get("/Blogs", function (req, res) {
  res.render("Blog");
});

// Albums Page
app.get("/Albums", function (req, res) {
  res.render("Albums", { user : req.user });
});

// Sub-Album (chua the xu ly duoc de sau vay)
app.get("/Albums/:id" , function (req, res) {
  // chuyen vao 1 cai id de no co the vong lap tao ra
  res.render("SubAlbum");
});

// port  listen 8080
app.listen(8080, function (err) {
    if(err)
      console.error(err);
    console.log("Server is connecting in 8080");
});
