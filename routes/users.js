var express = require('express');
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: "./uploads" }); // Handle File Uploads
var bcrypt = require('bcryptjs');
var salt = 10; //Numbers of randomly generated String of characters
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

router.post('/register', [
  check('name').isEmpty().withMessage('Name Required'),
  check('username').isEmpty().withMessage('Name Username Required'),
  check('email').isEmail().normalizeEmail(),
  check('password').isEmpty().isLength({ min: 5 }),
  check('password2').isEmpty().matches('password')
]
  , upload.single("profileImage"), function (req, res, next) {

    // Getting values
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var profileImage = req.body.profileImage;
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
          profileImage: profileImage
        });
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
        else {
          user_new.save()
            .then(doc => {
              res.location("/users/register");
              res.redirect("/")
            })
            .catch(err => {
              console.error(err)
            })
        }
      }
    })



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
