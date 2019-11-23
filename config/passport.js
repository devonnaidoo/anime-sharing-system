const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcryt = require('bcryptjs');
const User = require("../models/users_db");


module.exports = function (passport) {
    passport.use(new LocalStrategy({ username: 'username' },
        function (username, password, done) {

            User.findOne({ username: username }, function (err, users) {
                // Error Handler
                if (err) {
                    return done(err);
                }
                // If username does not exist
                if (!users) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                // If password does not exist
                // password - is what the user types into the form
                // user.password - is the user's password that is stored in the database
                bcryt.compare(password, users.password, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, users);
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                });

            });
        }
    ));

    passport.serializeUser(function (users, done) {
        done(null, users.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, users) {
            done(err, users);
        });
    });
}
