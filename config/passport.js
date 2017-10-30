// config/passport.js
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/db/user');

module.exports = function(passport) {
	// serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass back the entire request to the callback
	},
	function(req, email, password, done) {
		let emailId = email.trim().toLowerCase();
		// user.findOne wont fire unless data is sent back
		process.nextTick(function() {
			// checking to see if the user trying to login already exists
			User.findOne({ 'email':  emailId }, function(err, user) {
				if (err) return done(err);
				// check to see if there is already a user with that email
				if (user && user.joined) {
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
				} else {
					// create a new user
					var newUser	= user || new User();
					newUser.email = emailId;
					newUser.password = newUser.generateHash(password);
					newUser.joined = true;
					newUser.lastSean = new Date();
					newUser.save(function(err) {
						if (err) throw err;
						return done(null, newUser);
					});
				}
			});	
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass back the entire request to the callback
	},
	function(req, email, password, done) {
		let emailId = email.trim().toLowerCase();
		// checking to see if the user trying to login already exists
		User.findOne({ 'email': emailId }, function(err, user) {
			if (err) return done(err);
			// if no user is found, return the message
			if (!user || !user.joined) {
				return done(null, false, req.flash('loginMessage', 'No user found.'));
			}
			// if the user is found but the password is wrong
			if (!user.validPassword(password)) {
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			}
			return done(null, user);
		});
	}));
}
