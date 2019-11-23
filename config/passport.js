const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcryt = require('bcryptjs');
const User = require("../models/users_db");


module.exports = function (passport) {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            // Get form data
            var username = 'username';
            var password = 'password';

            User.findOne({ username: username }, function (err, user) {
                // Error Handler
                if (err) {
                    return done(err);
                }
                // If username does not exist
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                // If password does not exist
                // password - is what the user types into the form
                // user.password - is the user's password that is stored in the database
                bcryt.compare(password, user.passord, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                });

            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}
