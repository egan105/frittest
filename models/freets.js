var mongoose = require('mongoose');
var Users = require('../models/users')

//Define the schema for our Tweets model
var freetsSchema = mongoose.Schema({
    _creatorID: { type: String, ref: 'Users' },
    updatedAt: Date,
    content: String,
    retweetsID: [{ type: String, ref: 'Users' }]

});

module.exports = mongoose.model('Freets', freetsSchema);