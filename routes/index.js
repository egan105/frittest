var express = require('express');
var router = express.Router();

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
	var db = req.db;
  	var students = db.get('people');
  	students.find({'name':req.body.user.toLowerCase()}, function(err, usr) {
        if( err || usr.length === 0) {
        	res.render('index/index', { title: 'Fritter', message: 'Invalid username/password combination.'});
        }

        else {
        	var username = usr[0].name;
  			var password = usr[0].pw;
  			//If username and password match existing user then create new session with this user
	        if (username === req.body.user.toLowerCase() && password === req.body.password) {
	        	if (!req.session.userName) {
	        		req.session.userName = req.body.user.toLowerCase();
	        	}
	        	res.redirect("/users/"+username);
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
		var db = req.db;
	  	var students = db.get('people');
		students.find({ name: req.params.name }, function (err, usr) {
			if (err || usr.length === 0) res.redirect('/users')
			else {
				res.render('index/profile', {title: 'Fritter', user: usr[0], freets: usr[0].freets, session: req.session.userName});
			}
		});
	}
});

module.exports = router;
