'use strict';

var Auth = require('../lib/Authorization');

var auth = new Auth();

auth.token().then(function (token) {
	console.log('Have token to play with:', token);
});