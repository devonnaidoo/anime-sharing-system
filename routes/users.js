var express = require('express');
var router = express.Router();
var multer = require("multer");

var passport = require('passport'); //Login Auth
var LocalStrategy = require('passport-local').Strategy;

// Multer setup and configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
})
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
var mongoose = require("mongoose");
var mongoDB = "mongodb://localhost/anime_manager";
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
  res.render('login', { title: 'Login' });
});

// Authenticate login




// Registeration route
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});


// Form registeration
router.post('/register', upload.single("profileImage"), function (req, res, next) {

  // Validation for form
  req.checkBody('name', 'Name Required').notEmpty();
  req.checkBody('username', 'Username Required').notEmpty();
  req.checkBody('email', 'Email Required').isEmail();
  req.checkBody('password', 'Passwords must match').equals(req.body.password2);

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
            res.location("/");
            res.redirect("/");
          })
          .catch(err => {
            console.error(err)
          })
      }
    })
  }
});

module.exports = router;
