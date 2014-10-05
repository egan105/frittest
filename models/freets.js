var mongoose = require('mongoose');
var Users = require('../models/users')
//mongoose.model('Users');

//Define the schema for our Tweets model
var freetsSchema = mongoose.Schema({
    _creatorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    time: Date,
    content: String,
    retweetsID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]

});

module.exports = mongoose.model('Freets', freetsSchema);