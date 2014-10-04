var mongoose = require('mongoose');
var Freets = require('../models/freets');

//Define the schema for our User model
var userSchema = mongoose.Schema({
    name: String,
    password: String,
    freets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Freets'}]
});

// methods ======================
// generating a hash
//userSchema.methods.generateHash = function(password) {
//    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
//};

// checking if password is valid
//userSchema.methods.validPassword = function(password) {
//    return bcrypt.compareSync(password, this.local.password);
//};

module.exports = mongoose.model('Users', userSchema);