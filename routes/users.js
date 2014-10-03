var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Freets = require('../models/freets');
var mongoose = require('mongoose');

//Get the users page, showing all the existing users
router.get('/', function(req, res) {
	//Only logged in users can access this page
	if (!req.session.userName) {
		res.redirect('/');
	}
	else {
		Users.find({}, function(err, usr){
			if (err) return console.error(err);
			else {
				res.render('users/index', { title: 'Users', 'individuals': usr , 'session':req.session.userName});
			}
		});
	}
});

//Get the signup form
router.get('/new', function(req, res) {
	if (req.session.userName) {
		res.redirect('/users/' + req.session.userName);
	}
	else {
		res.render('users/new', { title: 'Add New User', message: '' });
	}
});

//Post the signup form and add user to database
router.post('/create', function(req, res, next) {
  	//Prevents empty fields
  	if (req.body.user === '' || req.body.user_pw === '') {
  		res.render('users/new', { title: 'Add New User', message: 'All fields must be completed.' });
  	}

  	else {
	  	Users.findOne({'name':req.body.user.toLowerCase()}, function(err, usr) {
	  		if (err) return console.error(err);
	  		//Can't choose username that already exists
	  		else if (usr !== null) {
	  			res.render('users/new', { title: 'Add New User', message: 'Username already exists.' });
	  		}

	  		else {
	  			req.session.userName = req.body.user.toLowerCase();
	  			var newUser = new Users({"name": req.body.user.toLowerCase(), "password": req.body.user_pw});
	  			newUser.save(function(err, usr){
					if (err) return handleError(err);
					else {
						res.redirect("/users/" + req.body.user.toLowerCase());
					}
				});
	  		}	
	  	});
	}
});

//Post a new freet
router.post('/newfreet', function(req, res, next) {
  	var user = req.body.user.toLowerCase();
  	var freet = req.body.user_post;
  	var d = new Date();
  	var date = d.getTime();

  	if (freet != '') {
  		var newFreet = new Freets({"name": user, "time": date, "content": freet});
  		newFreet.save(function(err, freeted){
			if (err) return console.error(err);
			else {
				Users.findOneAndUpdate({"name": user}, {$push: {"freets": newFreet}}, {safe: true, upsert: true}, function(err, model) {
				        if (err) return console.error(err);
				        else res.redirect("/users/" + user);
				    }
				);
			}
		});
  	}
});

//Delete freets from profile
router.post('/delete', function(req, res, next) {
  	var user = req.body.user.toLowerCase();

  	var id = mongoose.Types.ObjectId(req.body.freet);
  	Freets.find({_id: id}).remove(function(err, result) {
  		if (err) return console.error(err);
  		else res.redirect("/users/" + user);
  	})
});

//Edit a freet on one's profile
router.post('/edit', function(req, res, next) {
  	var user = req.body.user.toLowerCase();
  	var newFreet = req.body.user_post_edit;
  	var d = new Date();
  	var date = d.getTime()

  	var id = mongoose.Types.ObjectId(req.body.freet);
  	Freets.update({_id: id}, {"time": date, "content": newFreet}, function(err, result) {
  		console.log(result)
  		if (err) return console.error(err);
  		else res.redirect("/users/" + user);
  	})
});

module.exports = router;
