var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.filename + "-" + Date.now() + path.extname(file.originalname))
  }
})
var upload = multer({ storage: storage }); // Handle File Uploads
var bcrypt = require('bcryptjs');
var salt = 10; //Numbers of randomly generated String of characters
// var flash = require("connect-flash");
var { check, validationResult } = require("express-validator/check");
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

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', upload.single("profileImage"), function (req, res, next) {

  req.checkBody('name', 'Name Required').notEmpty();
  req.checkBody('username', 'Username Required').notEmpty();
  req.checkBody('email', 'Email Required').isEmail();
  req.checkBody('password', 'Passwords must match').equals(req.body.password2);

  // Getting values
  var name = req.body.name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var profileImage = req.body.profileImage;
  console.log(req.file.filename)

  // Finds the validation errors in this request and wraps them in an object with handy functions
  let errors = req.validationErrors();
  if (errors) {
    var errorsMessages = [];
    for (var obj in errors) {
      errorsMessages.push(errors[obj].msg)
    }
    console.log(errorsMessages);
    req.flash('error', errorsMessages);
    res.redirect("/users/register");
    console.log(errors);
  }
  else {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        throw err
      } else {
        var user_new = new User({
          _id: new mongoose.Types.ObjectId(),
          name: name,
          username: username,
          email: email,
          password: hash,
          profileImage: req.file.path
        });

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



// router.post('/register',
//   // [
//   //   check('name').isEmpty().withMessage('Name Required'),
//   //   check('username').isEmpty().withMessage('Name Username Required'),
//   // ], upload.single("profileImage"), function (req, res, next) 
//   {
//     // Finds the validation errors in this request and wraps them in an object with handy functions
//     // const errors = validationResult(req);
//     // if (!errors.isEmpty()) {
//     //   return res.status(422).json({ errors: errors.array() })
//     // }
//     // Getting values
//     // var name = req.body.name;
//     // var username = req.body.username;
//     // var email = req.body.email;
//     // var password = req.body.password;
//     // var password2 = req.body.password2;
//     // var profileImage = req.body.profileImage;

//     // Checking for file 
//     // if (req.file) {
//     //   console.log('Works');
//     // } else {
//     //   console.log('Not Working');
//     // }

//     // Push to database
//     // user.save(function (err) {
//     //   if (err) return handleError(err);

//     // });


//   });

module.exports = router;
