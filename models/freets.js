var mongoose = require('mongoose');
var Users = require('../models/users')
//mongoose.model('Users');

//Define the schema for our Tweets model
var freetsSchema = mongoose.Schema({
    _creatorID: { type: String, ref: 'Users' },
    time: Date,
    content: String
});

module.exports = mongoose.model('Freets', freetsSchema);