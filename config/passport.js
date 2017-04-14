var localStrategy = require("passport-local").Strategy; // dung de xac thuc cuc vo


var User = {
     id : String,
     username : String,
     password : String,
     email : String,
     avatar : String
};

module.exports = function functionName(passport, pool) {


    // xac thuc 1 nguoi dung thanh cong va luu lai vao session
    passport.serializeUser(function (user, done) {
        console.log("serializeUser");
        console.log(user);
        done(null, user);
    });

    // loai bo 1 nguoi dung ra khoi
    passport.deserializeUser(function (id, done) {
        user.findById(id, function (err, users) {
            done(err, users);
        });
    });

    passport.use("register", new localStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true
    },function (req, username, password, done) {
        process.nextTick(function () {
            // save
            console.log(username, password);
            req.session.user = username;
            req.session.password = password;
            req.session.email = req.body.email;
            console.log(req);
            //User.username = username;

            done(null, req.session);
        });
    }));

    passport.use("login", new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, username, password, done) {
        process.nextTick(function () {

        });
    }));


};
