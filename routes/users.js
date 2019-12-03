var express = require('express');
var router = express.Router();
var multer = require("multer");
const { ensureAuthenticated } = require('../config/auth');
var passport = require('passport'); //Login Auth
// Multer setup and configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
});
var upload = multer({
  storage: storage, fileFilter: function (req, file, callback) {
    var ext = require('path').extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      req.flash('error', 'Only images are allowed with the following extentions: png, jpg ,gif, jpeg');
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
}); // Handle File Uploads
var bcrypt = require('bcryptjs');
var salt = 10; //Numbers of randomly generated String of characters

// Database setup
var User = require("../models/users_db");
var Anime = require("../models/users_db");
// var Anime = require("../models/users_db");
var mongoose = require("mongoose");
var mongoDB = process.env.DB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Login route
router.get('/login', function (req, res, next) {
  User.findById({})
  res.render('login', { title: 'Login', auth: req.isAuthenticated() });
});

// Login route
router.get('/logout', function (req, res, next) {
  req.logout();
  req.flash('success', "You have logged out");
  req.session.destroy();
  res.redirect('/users/register');
});

// Authenticate login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    session: true,
    failureFlash: true
  })(req, res, next), function (req, res) {
    // Explicitly save the session before redirecting!
    // You can use req.user in dashboard
    req.session.save(() => {
      res.redirect('/users/dashboard');
    })
  }


});

// Registeration route
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register', auth: req.isAuthenticated() });
});

// Form registeration
router.post('/register', upload.single("profileImage"), function (req, res, next) {

  // Validation for form
  req.checkBody('name', 'Name Required').notEmpty();
  req.checkBody('username', 'Username Required').notEmpty();
  req.checkBody('email', 'Email Required').isEmail();
  req.checkBody('password', 'Must be more than 6 characters').isLength({ min: 6 })
  req.checkBody('password2', 'Passwords must match').equals(req.body.password);

  // Getting values from input
  var name = req.body.name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  if (req.file) {
    var profileImage = req.file.path;
  } else {
    var profileImage = "./uploads/no-image.jpg";
  }

  // Finds the validation errors in this request and wraps them in an object with handy functions
  let errors = req.validationErrors();
  if (errors) {
    // Looping the error messages and getting the msg key from the object and storing it in errorMessages array
    var errorsMessages = [];
    for (var obj in errors) {
      errorsMessages.push(errors[obj].msg)
    }
    req.flash('error', errorsMessages);
    res.redirect("/users/register");
  }
  else {
    // Encrypting Passwords
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        throw err;
      } else {
        // Creating a new user instance
        User.findOne({ username: username }, (err, users) => {
          if (err) {
            throw err;
          }
          if (users) {
            console.log("Users" + users);
            req.flash('error', 'User already exists');
            res.redirect('/users/register');
          }
          else {
            console.log(users);
            var user_new = new User({
              _id: new mongoose.Types.ObjectId(),
              name: name,
              username: username,
              email: email,
              password: hash,
              profileImage: profileImage
            });

            // Saves successfull registered user to DB
            user_new.save()
              .then(doc => {
                req.flash('success', 'User successfully added!');
                res.location("/users/login");
                res.redirect("/users/login");
              })
              .catch(err => {
                console.error(err)
              })
          }
        })
      }
    })
  }
});

// User Dashboard
router.get('/dashboard', ensureAuthenticated, function (req, res, next) {
  res.render('dashboard', { title: 'Dashboard', username: req.user.username });
});

// Add new anime
// Registeration route
router.get('/dashboard/add/:id', function (req, res, next) {
  res.render('add_anime', { title: 'Add' });
});

// Form registeration
router.post('/dashboard/add/:id', function (req, res, next) {

  // Validation for form
  req.checkBody('title', 'Title Required').notEmpty();
  req.checkBody('source', 'Source Required').notEmpty();


  // Getting values from input
  var title = req.body.title;
  var source = req.body.source;


  // Finds the validation errors in this request and wraps them in an object with handy functions
  let errors = req.validationErrors();
  if (errors) {
    // Looping the error messages and getting the msg key from the object and storing it in errorMessages array
    var errorsMessages = [];
    for (var obj in errors) {
      errorsMessages.push(errors[obj].msg)
    }
    req.flash('error', errorsMessages);
    res.redirect("/users/dashboard");
  }
  else {
    var user_anime = {
      _id: new mongoose.Types.ObjectId(),
      title: title,
      source: source
    };
    User.findOne({ _id: req.params.id }, function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.redirect('/');
      }
      user.anime.push({
        _id: new mongoose.Types.ObjectId(),
        title: "title",
        source: " source"
      })

      user.save(function (err) {
        if (err) {
          return next(err);
        } else {
          req.flash('success', 'Anime Successfully Created!');
          res.location("/users/dashboard");
          res.redirect("/users/dashboard");
        }
      });
    })
  }
});

module.exports = router;
