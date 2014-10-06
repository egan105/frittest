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
	console.log(clean);
	return clean
}

//Get the newsfeed for the user
router.get('/', function(req, res) {
	//Only logged in users can access this page
	if (!req.session.userName) {
		res.redirect('/');
	}
	else {
		Users.findOne({name: req.session.userName}, function(err, usr){
			if (err) return console.error(err);
			else {
				Users.find({name: {$in: usr.following}}, function (err, follow) {
					console.log(follow);
					if (err) return console.error(err);
					else {
						var news = usr.freets;
						for(var i = 0; i < follow.length; i++) {
							news = pushToNewsfeed(follow[i].freets, news);
						}
						Freets.find({_id: {$in: news}}, function (err, feed) {
							if (err) return console.error(err);
							else res.render('newsfeed/index', {title: 'Fritter', user: usr, freets: feed, session: usr});
						});
					}
				});
			}
		});
	}
});

//Retweet a post
router.post('/retweetFeed', function(req, res, next) {
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
		  			res.redirect("/newsfeed");
				}
  			});
  		}
  	});
});

//Delete freets from profile
router.post('/deleteFeed', function(req, res, next) {
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
  			res.redirect("/newsfeed");
  		}
  	});
});

//Untweet a retweet
router.post('/untweetFeed', function(req, res, next) {
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
  			res.redirect("/newsfeed");
  		}
  	});
});

//Edit a freet on one's profile
router.post('/editFeed', function(req, res, next) {
  	var user = req.session.userName;
  	var newFreet = req.body.user_post_edit;
  	var d = new Date();
  	var date = d.getTime();

  	var id = mongoose.Types.ObjectId(req.body.freet);
  	Freets.findByIdAndUpdate(id, { $set: { updatedAt: date, content: newFreet }}, function (err, result) {
		if (err) return handleError(err);
		else res.redirect("/newsfeed");
	});
});

module.exports = router;
