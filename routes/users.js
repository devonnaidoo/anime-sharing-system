var express = require('express');
var router = express.Router();
var multer = require("multer");
// Handle File Uploads
var upload = multer({ dest: "./uploads" });

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', upload.single("profileimage"), function (req, res, next) {
  // Getting values
  var name = req.body.name;
  var username = req.body.username;
  console.log(name + username);
});

module.exports = router;
