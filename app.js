var createError = require("http-errors");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var logger = require("morgan");
var expressValidator = require("express-validator");
var flash = require('express-flash');
var passport = require("passport");
const MongoStore = require('connect-mongo')(session);
require("./config/passport")(passport);

// Routes
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

// Express initiate
var app = express();

// Database config
var mongoose = require("mongoose");
var mongoDB = "mongodb://localhost/anime_manager";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware config
app.use('/uploads', express.static('upload')); // public folder
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/x-www-form-urlencoded
app.use(expressValidator()); // Validator middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Express session middleware
app.use(
  session({
    secret: "userAuth",
    saveUninitialized: true,
    resave: false,
    cookie: { secure: false, maxAge: 60000 },
    store: new MongoStore({
      url: "mongodb://localhost/anime_manager",
      ttl: 14 * 24 * 60 * 60  // = 14 days. Default
    })
  })
);

// Passport - Authentification System
app.use(passport.initialize());
app.use(passport.session());

// Express messages middleware - has to implemented before router
app.use(flash());

// Routes
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
  // User Access Control
  res.locals.users = req.isAuthenticated();
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
