var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

// Creating a schema properties
var users = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    username: String,
    email: String,
    password: String,
    profileImage: String
});


module.exports = mongoose.model('User', users)