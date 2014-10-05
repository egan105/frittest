var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Freets = require('../models/freets');
var mongoose = require('mongoose')

//Get home page
router.get('/', function(req, res) {
	//Redirect to user profile page if already logged in
	if (req.session.userName) {
		res.redirect('/users/'+req.session.userName);
	}
	else{
		res.render('index/index', { title: 'Fritter', message: ''});
	}
});

//Post login form
router.post('/', function(req, res, next) {
  	Users.findOne({'name':req.body.user.toLowerCase()}, function(err, usr) {
        if (err) return console.error(err);
        else if (usr === null) {
        	res.render('index/index', { title: 'Fritter', message: 'Username does not exist.'});
        }

        else {
        	var username = usr.name;
  			var password = usr.password;
  			//If login information match existing user then create new session with this user
	        if (username === req.body.user.toLowerCase() && password === req.body.password) {
	        	if (!req.session.userName) {
	        		req.session.userName = req.body.user.toLowerCase();
	        	}
	        	res.redirect("/users/" + username);
	        }
	  		else {
	  			res.render('index/index', { title: 'Fritter', message: 'Invalid username/password combination.'});
	  		}
	  	}
    });
});

//Logout user by ending session
router.get('/logout', function(req, res) {
	if (req.session.userName) {
		req.session.destroy();
		res.redirect('/');
	}
});

//Go to user profile page
router.get('/users/:name', function(req, res) {
	//Only allow access to user pages if a user is logged in
	if (req.params.name === 'new') {
		res.render('users/new', { title: 'Add New User', message: '' });
	}
	else if (!req.session.userName) {
		res.redirect('/');
	}
	else {
		Users.findOne({ name: req.params.name }, function (err, usr) {
			if (err) return console.error(err);
			else if (usr === null) {
				res.redirect('/users');
			}
			else {
				//Get freets of user
				Freets.find().where('_id').in(usr.freets).exec(function (err, records) {
					if (err) console.error(err);
					else {
						res.render('index/profile', {title: 'Fritter', user: usr, freets: records, session: req.session.userName});
					}
				});
			}
		});
	}
});

module.exports = router;
