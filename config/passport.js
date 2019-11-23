const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcryt = require('bcryptjs');
const User = require("../models/users_db");


module.exports = function (passport) {
    // passport.use(new LocalStrategy(
    //     function (username, password, done) {
    //         // Get form data
    //         var username = 'username';
    //         var password = 'password';

    //         User.findOne({ username: username }, function (err, user) {
    //             if (err) {
    //                 return done(err);
    //             }
    //             if (!user) {
    //                 return done(null, false, { message: 'Incorrect username.' });
    //             }
    //             if (!user.validPassword(password)) {
    //                 return done(null, false, { message: 'Incorrect password.' });
    //             }
    //             return done(null, user);
    //         });
    //     }
    // ));

    // passport.serializeUser(function (user, done) {
    //     done(null, user.id);
    // });

    // passport.deserializeUser(function (id, done) {
    //     User.findById(id, function (err, user) {
    //         done(err, user);
    //     });
    // });
}
