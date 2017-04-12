var express = require("express");
var bodyparser = require("body-parser");
var app = express();
var pg = require("pg");
var urlencodeParser = bodyparser.urlencoded({extended:true});

var config = {
  user: 'postgres', //env var: PGUSER
  database: 'Photo', //env var: PGDATABASE
  password: 'hocmap123', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);


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

  //res.render("Albums", { user : req.user });
  // xu ly 1 chut cai nay
      pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('SELECT albumcode, albumname, tongsoluotview, linkdaidien, username, avatar from albumsd a, "user" b where a.userid = b.id', function(err, result) {
      done(err);

      if(err) {
        res.end();
        return console.error('error running query', err);
      }
        res.render("Albums", {user : req.user , infomation: result});
      });
    });
});




// Sub-Album (chua the xu ly duoc de sau vay)

app.get("/SubAlbum/:id" , function (req, res) {
      //res.render("SubAlbum", { user : req.user });
      // chuyen vao 1 cai id de no co the vong lap tao ra
      pool.connect(function(err, client, done) {
        if(err) {
          return console.error('error fetching client from pool', err);
        }

        client.query('SELECT albumcode, albumname, tongsoluotview, linkdaidien, username, avatar from albumsd a, "user" b where a.userid = b.id' , function(err, result) {
                done(err);

                if(err) {
                  res.end();
                  return console.error('error running query', err);
                }
               var codeAlbums = req.params.id;
               client.query('SELECT albumcode, albumname, imagecodesx, noidunganh, linkimage, soview, username, avatar from albumsd d, chitietalbum b, images c , "user" a where b.albumsids = ' + codeAlbums + ' and b.imageids = c.imagecodesx and c.usercreate = a.id and d.albumcode = b.albumsids;', function (err, result1) {
                done(err);

                if(err) {
                  res.end();
                  return console.error('error running query', err);
                }

                res.render("SubAlbum", { user : req.user , infomation: result, infomation1: result1 });
              })
        })
    })
})



app.get("/Detailimage/:albumcode/:namepage/:id", function (req, res) {
      pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      var namespacesc = req.params.namepage;
      var idCode = req.params.id;
      var albumcode = req.params.albumcode;

      client.query('select imagecodesx, noidunganh, linkimage, soview, username, avatar from images a, "user" b where a.usercreate = b.id and a.imagecodesx = ' + idCode, function(err, result) {
        done(err);
        if(err) {
          res.end();
          return console.error('error running query', err);
        }
        res.render("Detail", {user : req.user, codeAlbums : albumcode,  nameAlbum:  namespacesc, infomation: result.rows[0]});
      });
    });
});

app.get("/Detail", function (req, res) {
    res.render("Detail");
});

// port  listen 8080
app.listen(8080, function (err) {
    if(err)
      console.error(err);
    console.log("Server is connecting in 8080");
});
