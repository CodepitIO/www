'use strict';

const LocalStrategy = require('passport-local').Strategy,
	User = require('../models/user');

module.exports = (passport) => {

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, done);
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, done) => {
		User.findOne({
			'local.email': email
		}, (err, user) => {
			if (err) return done({
				error: err
			});
			if (user) return done({
				error: "Um usuário com este email já existe."
			});

			let newUser = new User();
			let account = req.body;

			newUser.local.name = account.name;
			newUser.local.surname = account.surname;
			newUser.local.email = account.email;
			newUser.local.username = account.username;
			newUser.local.password = newUser.generateHash(account.password);

			newUser.save((err) => {
				if (err) return done({
					error: err
				});
				return done(null, newUser.toObject({
					virtuals: true
				}));
			});
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, (req, email, password, done) => {
		User.findOne({
			'local.email': email
		}, function(err, user) {
			if (err) return done({
				error: err
			});
			if (!user || !user.validPassword(password)) {
				return done({
					error: "Email ou senha inválida."
				});
			}
			return done(null, user.toObject({
				virtuals: true
			}));
		});
	}));

};