var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const url = require('url');
var mongoose = require("mongoose");
var mongoDB = "mongodb://localhost/anime_manager";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home', auth: req.isAuthenticated() });
});

router.get('/dashboard', ensureAuthenticated, function (req, res, next) {
  res.render('dashboard', { title: 'Dashboard', username: req.user.name });
});

module.exports = router;
