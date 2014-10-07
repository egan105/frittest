var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Freets = require('../models/freets');
var mongoose = require('mongoose')

//Return whether or not the value is in the array
var isInArray = function(value, array) {
  return array.indexOf(value) > -1;
}

//Extend an array with another array
var pushToNewsfeed = function(value, array) {
	var clean = array;
	value.forEach(function(entry) {
		//Prevents duplicates of tweet and tweets by logged in user from appearing on the news feed
		if (!(isInArray(entry, clean))) {
			clean.push(entry);
		}
	});
	return clean
}

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

//Get the signup form
router.get('/new', function(req, res) {
	if (req.session.userName) {
		res.redirect('/users/' + req.session.userName);
	}
	else {
		res.render('index/new', { title: 'Add New User', message: '' });
	}
});

router.post('/create', function(req, res, next) {
  	//Prevents empty fields
  	if (req.body.user === '' || req.body.user_pw === '') {
  		res.render('index/new', { title: 'Add New User', message: 'All fields must be completed.' });
  	}

  	else {
	  	Users.findOne({'name':req.body.user.toLowerCase()}, function(err, usr) {
	  		if (err) return console.error(err);
	  		//Can't choose username that already exists
	  		else if (usr !== null) {
	  			res.render('index/new', { title: 'Add New User', message: 'Username already exists.' });
	  		}

	  		else {
	  			//Initialize session with this new user and update database
	  			req.session.userName = req.body.user.toLowerCase();
	  			var newUser = new Users({"name": req.session.userName, "password": req.body.user_pw});
	  			newUser.save(function(err, usr){
					if (err) return console.error(err);
					else res.redirect("/users/" + req.session.userName);
				});
	  		}	
	  	});
	}
});

//Post login form
router.post('/', function(req, res, next) {
  	Users.findOne({'name':req.body.user.toLowerCase()}, function(err, usr) {
        if (err) return console.error(err);
        //Username does not match any in current database
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
	if (!req.session.userName) {
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
				Freets.find({_id: {$in: usr.freets}}, function (err, record) {
					if (err) console.error(err);
					else {
						Users.findOne({ name: req.session.userName }, function (err, orig) {
							if (err) return console.error(err);
							//User is being followed by current logged in user
							else if (isInArray(usr.name, orig.following)) {
								res.render('index/profile', {title: 'Fritter', user: usr, freets: record, session: orig, following: true});
							}
							else res.render('index/profile', {title: 'Fritter', user: usr, freets: record, session: orig, following: false});
						});
					}
				});
			}
		});
	}
});

//Get the users that you are following
router.get('/users/:name/following', function(req, res) {
	//Only logged in users can access this page
	if (!req.session.userName) {
		res.redirect('/');
	}
	//Send user to the users page if we does not have proper access to view
	else if (req.session.userName !== req.params.name) {
		res.redirect('/users');
	}
	else {
		Users.findOne({name: req.session.userName}, function(err, usr){
			if (err) return console.error(err);
			else res.render('follow/following', { title: 'Users', 'user': usr});
		});
	}
});

//Get the users page, showing all users that begin with the search
router.post('/search', function(req, res) {
	var search = req.body.search.toLowerCase();
	//Only logged in users can access this page
	if (!req.session.userName) {
		res.redirect('/');
	}
	else {
		//All users that start with the search will appear
		Users.find({name: new RegExp('^'+search)}, function(err, usr){
			if (err) return console.error(err);
			else {
				res.render('users/index', { title: 'Users', 'individuals': usr, 'session':req.session.userName});
			}
		});
	}
});

module.exports = router;
