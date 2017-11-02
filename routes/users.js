module.exports = function (passport) {
	var express = require('express');
	var router = express.Router();

	router.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	router.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// process the login form
	router.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true // allow flash messages
	}));

	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	return router;
}
