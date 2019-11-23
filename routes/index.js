var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.isAuthenticated());
  res.render('index', { title: 'Home', isLoggedIn: req.isAuthenticated() });
});

router.get('/dashboard', ensureAuthenticated, function (req, res, next) {
  console.log(req.isAuthenticated());
  res.render('dashboard', { title: 'Dashboard', username: req.user.name });
});
module.exports = router;
