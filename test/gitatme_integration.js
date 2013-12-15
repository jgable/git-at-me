'use strict';

var github = require('../index');

github({
	token: require('../github-token'),
	user: 'jgable',
	repo: 'git-at-me',
	port: 8000,
	// Update this based on new ngrok proxy
	url: 'http://5ab4d666.ngrok.com'
}).on('error', function (err) {
	console.log('error', err);
}).on('token', function (token) {
	console.log('token', token);
}).on('hook', function (hook) {
	console.log('hook', hook);
}).on('server', function (server) {
	console.log('server started');
}).on('push', function (data) {
	console.log('push', data);
});