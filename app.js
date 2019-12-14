require('dotenv').config();
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
var mongoDB = process.env.DB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware config
app.use('/uploads', express.static('uploads')); // public folder
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
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 60000 }, //Added extra zero
    store: new MongoStore({
      url: process.env.DB_URL,
      touchAfter: 24 * 24 * 60 * 60,
      ttl: 24 * 24 * 60 * 60  // 2 days
    })
  })
);

// Passport - Authentification System
app.use(passport.initialize());
app.use(passport.session());

// Express messages middleware - has to implemented before router
app.use(flash());

app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.userInfo = req.user;
  next();
});

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
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
