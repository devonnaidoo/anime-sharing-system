var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var animeSchema = new Schema({
    title: { type: String },
    source: { type: String },
    genre: { type: String },
    animeImage: { type: String }
});

// Creating a schema properties
var users = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, lowercase: true, required: true, },
    password: { type: String, minlength: 6 },
    profileImage: String,
    anime: [animeSchema]
});


module.exports = mongoose.model('User', users);