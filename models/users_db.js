var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var animeSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: { type: String, required: false },
    source: { type: String, required: false },
    user: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

// Creating a schema properties
var users = new Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, lowercase: true, required: true, },
    password: { type: String, minlength: 6 },
    profileImage: String,
    anime: [{ type: Schema.Types.ObjectId, ref: "Anime" }]
});




module.exports = mongoose.model('Anime', animeSchema);
module.exports = mongoose.model('User', users);