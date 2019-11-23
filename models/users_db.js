var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

// Creating a schema properties
var users = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, lowercase: true, required: true, },
    password: { type: String, minlength: 6 },
    profileImage: String
});


module.exports = mongoose.model('User', users)