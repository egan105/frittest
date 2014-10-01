var express = require('express');
var router = express.Router();

//Get the users page, showing all the existing users
router.get('/', function(req, res) {
	//Only logged in users can access this page
	if (!req.session.userName) {
		res.redirect('/');
	}
	else {
		var db = req.db;
		var students = db.get('people');
		students.find({}, function(e, docs){
			res.render('users/index', { title: 'Users', 'individuals': docs , 'session':req.session.userName});
		});
	}
});

//Get the signup form
router.get('/new', function(req, res) {
	if (req.session.userName) {
		res.redirect('/users/'+req.session.userName);
	}
	else {
		res.render('users/new', { title: 'Add New User', message: '' });
	}
});

//Post the signup form and add user to database
router.post('/create', function(req, res, next) {
	var db = req.db;
  	var students = db.get('people');

  	//Prevents empty fields
  	if (req.body.user === '' || req.body.user_pw === '') {
  		res.render('users/new', { title: 'Add New User', message: 'All fields must be completed.' });
  	}

  	else {
	  	students.find({'name':req.body.user.toLowerCase()}, function(err, usr) {
	  		//Can't choose username that already exists
	  		if (usr.length > 0) {
	  			res.render('users/new', { title: 'Add New User', message: 'Username already exists.' });
	  		}

	  		else {
	  			req.session.userName = req.body.user.toLowerCase();
	  			students.insert({"name": req.body.user.toLowerCase(), "pw": req.body.user_pw, "freets": []}, function(err, docs){
					if (err) res.send("There was a problem");
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
	var db = req.db;
  	var students = db.get('people');
  	var user = req.body.user.toLowerCase();
  	var freet = req.body.user_post;
  	var d = new Date();
  	var date = d.getTime()

  	if (freet != '') {
  		students.find({'name':user}, function(err, usr) {
	  		students.update({'name':user}, {'$push': {'freets': [date, freet]}});
	  		res.redirect("/users/"+user);
	  	});
  	}
});

//Delete freets from profile
router.post('/delete', function(req, res, next) {
	var db = req.db;
  	var students = db.get('people');
  	var user = req.body.user.toLowerCase();

  	//req.body.freet is returned as a string, need to put back in list form
  	var freet = req.body.freet;
  	var words = freet.substring(freet.indexOf(",")+1);
  	var id = Number(freet.substring(0,freet.indexOf(",")));
  	var match = [id,words];

  	students.find({'name':user}, function(err, usr) {
  		students.update({'name':user}, {'$pull': {'freets': match}});
  		res.redirect("/users/"+user);
	});
});

//Edit a freet on one's profile
router.post('/edit', function(req, res, next) {
	var db = req.db;
  	var students = db.get('people');
  	var user = req.body.user.toLowerCase();

  	var newfreet = req.body.user_post_edit;
  	var d = new Date();
  	var date = d.getTime()
  	var newmatch = [date,newfreet]
  	var index = req.body.i;

  	if (newfreet != '') {
  		students.find({'name':user}, function(err, usr) {
  			var password = usr[0].pw;
  			var freeters = usr[0].freets;
  			freeters.splice(index,1);
  			freeters.splice(index, 0, newmatch);
	  		students.update({'name':user}, {'name':user,'pw':password,'freets': freeters});
	  		res.redirect("/users/"+user);
	  	});
  	}
});

module.exports = router;
