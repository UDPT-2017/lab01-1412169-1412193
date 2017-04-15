var express = require("express");
var bodyParser = require("body-parser");
//var passport = require("passport");
var flash = require("connect-flash"); // passing message
var cookieParser = require("cookie-parser");
var session = require("express-session");
var multer = require("multer");
var app = express();
var pg = require("pg");

var urlencodeParser = bodyParser.urlencoded({extended:true});

app.use(urlencodeParser);

var usersx = {
    username : String,
    password : String,
    email : String,
    avatar : String
}

var config = {
  user: 'postgres', //env var: PGUSER
  database: 'Photo', //env var: PGDATABASE
  password: '123456', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);


var storage = multer.diskStorage({
	destination:function(req, file, cb){
		cb(null, "./public/avatar");
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});

var upload = multer({storage:storage});

// Template engine

app.set("view engine", "ejs");

app.set("views", "./views");




// build middle ware
app.use(express.static(__dirname + "/public")); // dinh nghia file css, ....
app.use(cookieParser());
app.use(session({secret: "sdabsdgag123g1hghgsdhjgasdg21g3jhg12hj3g"}));
app.use(flash());


// setup all route

  // Home Page

app.get("/", function (req, res) {

  res.render("Home" , {user : req.session.user});

});




// About Page

app.get("/About", function (req, res) {
  res.render("About", {user : req.session.user} );
});




//  Blogs Page

app.get("/Blogs", function (req, res) {

      // res.render("Blog", {user : req.user} );
      pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('select blogcode, noidung ,linkanh, username, avatar, soluotview, ngaydang from blogs a, "user" b where a.usersx = b.id;', function(err, result) {
      done(err);

      if(err) {
        res.end();
        return console.error('error running query', err);
      }
        res.render("Blog", {user : req.session.user , infomation: result});
      });
    });
});

app.get("/BlogDetail/:id", function (req, res) {
    pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    var idcode = req.params.id;
    client.query('select blogcode, noidung ,linkanh, username, avatar, soluotview, ngaydang from blogs a, "user" b where a.usersx = b.id and a.blogcode = ' + idcode, function(err, result) {
    done(err);

    if(err) {
      res.end();
      return console.error('error running query', err);
    }
      //res.render("DetailBlogs", {user : req.session.user , infomation: result.rows[0], allcomment: result});
      client.query('select username, avatar, noidungdang, datescommit from "user" b, comment c where b.id = c.useridx and c.commentblog = ' + idcode, function (err, commentalls) {
         done(err);
         if(err){
           res.end();
           return console.error("error running query", err);
         }
         res.render("DetailBlogs", {user : req.session.user , infomation: result.rows[0], allcomment: commentalls});
      });
    });
  });
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
        res.render("Albums", {user : req.session.user , infomation: result});
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

                res.render("SubAlbum", { user : req.session.user , infomation: result, infomation1: result1 });
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

          client.query('select username, avatar, noidungdang, datescommit from "user" b, comment c where  b.id = c.useridx and c.commentimage = ' + idCode, function (err, result1) {
            done(err);
            if(err) {
              res.end();
              return console.error('error running query', err);
            }
            res.render("Detail", {user : req.session.user, codeAlbums : albumcode,  nameAlbum:  namespacesc, infomation: result.rows[0], allcomment : result1 });
          });
      });
    });
});

app.get("/Detail", function (req, res) {
    res.render("Detail");
});


//require("./config/passport.js")(passport, pool);
// process login

// include passport
//require("./config/passport.js")(passport, pool);

// check da login hay chua
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.session.user) // neu user bang undifile
          return next();
    res.redirect('/login');
    // if they aren't redirect them to the home page
}

// giai thich 1 chut ve ham nay neu thang do da dang nhap vao he thong va chua
// thoat ra thi ta chuyen huong cho no vao trang profile
//req.isUnauthenticated()
function isLoggedLong(req, res, next) {

    // if user is authenticated in the session, carry on
    // noi ra no ra kiem tra xem thang do co trong session hay chua
    // neu da co thi se chuyen huong
    // neu chua co thi se tiep tuc cac middleware
    if (req.session.user)
        res.redirect('/profile');

    // if they aren't redirect them to the home page
    return next();
}



app.get("/register", function (req, res) {
  res.render('RegisterPage', { user:req.session.user, message: req.flash('signupMessage') });
});
app.post("/register", upload.single("picAvartar"),function (req, res) {
  console.log("1 .");
  console.log(req.body);
  console.log(req.headers);
  pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      var usernameEnter = req.body.username;
      client.query('select * from "user" a where a.username = ' + "'" + usernameEnter + "';", function(err, result) {
          done(err);
          if(err) {
            res.end();
            return console.error('error running query', err);
          }
          if(result.rows.length > 0) {
            done(null, req.flash('signupMessage', "Username is already exist ! Please Again" ));
            //console.log(req.session.flash);
            res.redirect("/register");
          }
          usersx.username = req.body.username;
          usersx.password = req.body.password;
          usersx.email = req.body.email;
          usersx.photo = req.file.path.substring(7);
          var queryString = 'INSERT INTO public."user"(username, password, email, avatar) VALUES ( $1 , $2, $3, $4);';
          var para = [usersx.username, usersx.password, usersx.email, usersx.photo];
          client.query(queryString, para,function (err, user) {
              done(err);
              if(err) {
                done(null, req.flash('signupMessage', "Insert is error ! Please try again"));
                res.redirect("/register");
              }
              req.session.user = usersx;
              res.redirect("/profile");
          });
      });


    });
});
/*app.get("/Helloword", function (req, res) {
    res.render("login");
});

app.post("/Helloword", function (req, res) {
  console.log(req.body);
});*/



// login page isLoggedLong
app.get("/login", function (req, res) {
  res.render("register", { user : req.session.user, loginmessage: req.flash('loginMessage') });
});
/*var bodyParser1 = require("body-parser");
var urlencodeParser1 = bodyParser1.urlencoded({extended:true});*/

app.post("/login", function (req, res) {
  console.log(req.body);
  pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      var usernameEnter = req.body.fusername;
      console.log(usernameEnter);
      var password = req.body.fpassword;
      console.log(password);
      client.query('select * from "user" a where a.username = ' + "'" + usernameEnter  + "';", function(err, result) {
          done(err);

          if(err) {
            res.end();
            return console.error('error running query', err);
          }

          if(result.rows.length == 0 ) {

            done(null, req.flash('loginMessage', "Username or Password is incorrect" ));
            //console.log(req.session.flash);
            res.redirect("/login");
          }
          else if(password != result.rows[0].password) {

            done(null, req.flash('loginMessage', "Username or Password is incorrect" ));
            //console.log(req.session.flash);
            res.redirect("/login");
          } else {
            console.log("3. Success");
            usersx.username = result.rows[0].username;
            usersx.password = result.rows[0].password;
            usersx.email = result.rows[0].email;
            usersx.photo = result.rows[0].avatar;
            req.session.user = usersx;
            res.redirect("/");
          }
      });
    });
});

// profile Page isLoggedIn
app.get("/profile", isLoggedIn, function (req, res) {
  res.render("profile", {
      user : req.session.user // get the user out of session and pass to template
  });
});
// Log Out
app.get('/logout', function(req, res) {
    //req.logout();
    req.session.destroy(); // huy session hien tai
    res.redirect('/');
});


// port  listen 8080
app.listen(8080, function (err) {
    if(err)
      console.error(err);
    console.log("Server is connecting in 8080");
});
