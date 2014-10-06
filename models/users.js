var mongoose = require('mongoose');
var Freets = require('../models/freets');

//Define the schema for our User model
var userSchema = mongoose.Schema({
    name: String,
    password: String,
    freets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Freets'}],
    following: [{type: String, ref: 'Users'}]
});

module.exports = mongoose.model('Users', userSchema);