var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Freets = require('../models/freets');
var mongoose = require('mongoose');

//Return whether or not the value is in the array
var isInArray = function(value, array) {
  return array.indexOf(value) > -1;
}

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
					if (err) return console.error(err);
					else res.redirect("/users/" + req.body.user.toLowerCase());
				});
	  		}	
	  	});
	}
});

//Post a new freet
router.post('/newfreet', function(req, res, next) {
  	var user = req.session.userName
  	var freet = req.body.user_post;
  	var d = new Date();
  	var date = d.getTime();

  	if (freet != '') {
  		Users.findOne({'name': user}, function(err, usr) {
  			if (err) return console.error(err);
  			else {
  				var newFreet = new Freets({"_creatorID": usr.name, "udatedAt": date, "content": freet});
  				newFreet.save(function(err, freeted) {
					if (err) return console.error(err);
					else {
						//Populate the freet with the User
						Freets.findOne({ _id: freeted._id})
						.populate({
							path: 'name', 
							match: {name: '_creatorID'}
						})
						.exec(function (err, record) {
							if (err) return console.error(err);
							else {
								usr.freets.push(record);
								usr.save(function(err, update) {if (err) return console.error(err);})
								res.redirect("/users/" + record._creatorID);
							}
						})
					}
				});
  			}
  		});
  	}
});

//Delete freets from profile
router.post('/delete', function(req, res, next) {
  	var user = req.session.userName;
	var id = mongoose.Types.ObjectId(req.body.freet);
	Users.findOne({name: user}, function(err, result) {
  		if (err) return console.error(err);
  		else {
  			Freets.findOne({_id: id}, function(err, frt) {
  				//Remove this tweet on anyone's profile that has retweeted it
  				frt.retweetsID.forEach(function(entry) {
  					Users.findOne({name: entry}, function(err, usr) {
  						if (err) return console.error(err);
  						else if (usr !== null) {
	  						usr.freets.pull(id)
	  						usr.save(function(err, update) {if (err) return console.error(err);});
	  					}
  					});
  				});
  			});
  			result.freets.pull(id)
  			result.save(function(err, update2) {if (err) return console.error(err);});
  			res.redirect("/users/" + user);
  		}
  	});
});

//Untweet a retweet
router.post('/untweet', function(req, res, next) {
  	var user = req.session.userName;
	var id = mongoose.Types.ObjectId(req.body.freet);
	Users.findOne({name: user}, function(err, result) {
  		if (err) return console.error(err);
  		else {
  			Freets.findOne({_id: id}, function(err, frt) {
  				//Remove this tweet on anyone's profile that has retweeted it
  				frt.retweetsID.pull(result.name)
  				frt.save(function(err, update) {if (err) return console.error(err);});
  			});
  			result.freets.pull(id)
  			result.save(function(err, update2) {if (err) return console.error(err);});
  			res.redirect("/users/" + user);
  		}
  	});
});

//Edit a freet on one's profile
router.post('/edit', function(req, res, next) {
  	var user = req.session.userName;
  	var newFreet = req.body.user_post_edit;
  	var d = new Date();
  	var date = d.getTime();

  	var id = mongoose.Types.ObjectId(req.body.freet);
  	Freets.findByIdAndUpdate(id, { $set: { updatedAt: date, content: newFreet }}, function (err, result) {
		if (err) return handleError(err);
		else res.redirect("/users/" + user);
	});
});

//Edit a freet on one's profile
router.post('/retweet', function(req, res, next) {
  	var user = req.session.userName;

  	var id = mongoose.Types.ObjectId(req.body.freet);
  	Freets.findOne({_id: id}, function(err, result) {
  		if (err) return console.error(err);
  		else {
  			console.log(result)
  			Users.findOne({ name: user}, function(err, usr) {
  				if (err) return handleError(err);
  				else {
	  				if (!isInArray(usr.name, result.retweetsID)) {
		  				result.retweetsID.push(usr.name);
		  				result.save(function(err, update) {if (err) return console.error(err);});
		  			}
	  				//Cannot retweet the same tweet multiple tiimes
	  				if (!isInArray(result._id, usr.freets)) {
		  				usr.freets.push(result);
		  				usr.save(function(err, update2) {if (err) return console.error(err);});
		  			}
		  			res.redirect("/users/" + result._creatorID);
				}
  			});
  		}
  	});
});

//Add user to list of people following
router.post('/follow', function(req, res, next) {
  	var user = req.session.userName;
  	var follow = req.body.follow;

  	Users.findOne({ name: user}, function(err, usr) {
  		if (err) return handleError(err);
  		else {
	  		if (!isInArray(follow, usr.following)) {
	  			usr.following.push(follow);
	  			usr.save(function(err, update) {if (err) return console.error(err);});
	  			res.redirect("/users/" + follow);
	  		}
	  	}
  	});
});

//Remove user from list of people following
router.post('/unfollow', function(req, res, next) {
  	var user = req.session.userName;
  	var unfollow = req.body.unfollow;

  	Users.findOne({ name: user}, function(err, usr) {
  		if (err) return handleError(err);
  		else {
	  		if (isInArray(unfollow, usr.following)) {
	  			usr.following.pull(unfollow);
	  			usr.save(function(err, update) {if (err) return console.error(err);});
	  			res.redirect("/users/" + unfollow);
	  		}
	  	}
  	});
});

module.exports = router;
