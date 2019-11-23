var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var expressValidator = require("express-validator");
var flash = require('express-flash');
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcryptjs");
var multer = require("multer");
var upload = multer({ dest: "./uploads" }); // Handle File Uploads
var mongoose = require("mongoose");
var mongoDB = "mongodb://localhost/anime_manager";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection; //Get the default connection
var User = require("models/users_db");


var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// public folder
app.use('/uploads', express.static('upload'));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.json());
// Validator middleware
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Middleware Installing
app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 60000 }
  })
);

// Express messages middleware - has to implemented before router
app.use(flash())
// Passport - Authentification System
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function (username, password, done) {
    // Get form data
    var username = username;
    var password = password;

    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use("/", indexRouter);
app.use("/users", usersRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
