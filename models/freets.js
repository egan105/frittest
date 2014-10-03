var mongoose = require('mongoose');
var Users = require('../models/users')

//Define the schema for our Tweets model
var freetsSchema = mongoose.Schema({
    _creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    time: Date,
    content: String
});

module.exports = mongoose.model('Freets', freetsSchema);