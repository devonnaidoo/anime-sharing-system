var express = require('express');
var router = express.Router();
var multer = require("multer");
// Handle File Uploads
var upload = multer({ dest: "./uploads" });
var { check, validationResult } = require("express-validator/check");
var mongoose = require("mongoose");
var mongoDB = "mongodb://localhost/anime_manager";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});


// Creating a model
var user = mongoose.model('User', Users);

router.post('/register',
  // [
  //   check('name').isEmpty().withMessage('Name Required'),
  //   check('username').isEmpty().withMessage('Name Username Required'),
  // ], upload.single("profileImage"), function (req, res, next) 
  {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.array() })
    // }
    // Getting values
    // var name = req.body.name;
    // var username = req.body.username;
    // var email = req.body.email;
    // var password = req.body.password;
    // var password2 = req.body.password2;
    // var profileImage = req.body.profileImage;

    // Checking for file 
    // if (req.file) {
    //   console.log('Works');
    // } else {
    //   console.log('Not Working');
    // }

    // Push to database
    // user.save(function (err) {
    //   if (err) return handleError(err);

    // });


  });

module.exports = router;
