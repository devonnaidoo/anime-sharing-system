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
              profileImage: profileImage,
              anime: []
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
  res.render('dashboard', { title: 'Dashboard', username: req.user.username, anime: req.user.anime });
});

// Add new anime route
router.get('/dashboard/add/:id', function (req, res, next) {
  res.render('add_anime', { title: 'Add' });
});

// Add anime 
router.post('/dashboard/add/:id', upload.single("animeImage"), function (req, res, next) {

  // Validation for form
  req.checkBody('title', 'Title Required').notEmpty();
  req.checkBody('genre', 'Genre Required').notEmpty();
  req.checkBody('source', 'Source Required').notEmpty();
  if (req.file) {
    var animeImage = req.file.path;
  } else {
    var animeImage = "./uploads/default-image.jpg";
  }

  // Getting values from input
  var title = req.body.title;
  var genre = req.body.genre;
  var source = req.body.source;
  var animeImage = animeImage

  // Finds the validation errors in this request and wraps them in an object with handy functions
  let errors = req.validationErrors();
  if (errors) {
    // Looping the error messages and getting the msg key from the object and storing it in errorMessages array
    var errorsMessages = [];
    for (var obj in errors) {
      errorsMessages.push(errors[obj].msg)
    }
    req.flash('error', errorsMessages);
    res.redirect("/users/dashboard/add/" + req.params.id);
  }
  else {
    User.findOne({ _id: req.params.id }, function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.redirect('/');
      }
      user.anime.push({
        title: title,
        genre: genre,
        source: source,
        animeImage: animeImage
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

// Edit anime route
// router.get('/dashboard/edit/:id', function (req, res, next) {
//   res.render('edit_anime', { title: 'Edit' });
// });

// Edit anime from database subdocuments
router.get("/dashboard/edit/:id", upload.single("animeImage"), function (req, res, next) {
  User.findOne({ _id: req.user._id }).exec(function (err, results) {
    // Find array item by _id subdocs
    var animeToEdit = results.anime.find(
      // _id.toString. Mongo stores _id as ObjectId so in order to compare inputted _id to database it needs to be converted to a string
      ({ _id }) => _id.toString() === req.params.id
    )

    // Edit items
    animeToEdit.title = req.body.title;
    animeToEdit.genre = req.body.genre;
    animeToEdit.source = req.body.source;
    animeToEdit.animeImage = req.body.animeImage;

    // Save changes to database
    results.save().then(function () {
      req.flash('success', 'Anime Successfully Deleted!');
      res.location("/users/dashboard");
      res.redirect("/users/dashboard");
    });
  })
})

// Delete anime from database subdocuments
router.get("/dashboard/delete/:id", function (req, res, next) {
  User.findOne({ _id: req.user._id }).exec(function (err, results) {
    console.log(results)
    var animeToDelete = results.anime.filter(({ _id }) => _id.toString() !== req.params.id);
    results.anime = animeToDelete;
    results.save().then(function () {
      req.flash('success', 'Anime Successfully Deleted!');
      res.location("/users/dashboard");
      res.redirect("/users/dashboard");
    });
  })
})

module.exports = router;
