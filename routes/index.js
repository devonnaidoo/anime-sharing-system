var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var mongoose = require("mongoose");
var mongoDB = process.env.DB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home', auth: req.isAuthenticated() });
});



module.exports = router;