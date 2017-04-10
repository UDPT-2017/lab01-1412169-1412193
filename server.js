var express = require("express");
var app = express();


// port  listen 8080
app.listen(8080, function (err) {
    if(err)
      console.error(err);
    console.log("Server is connecting in 8080");
});
