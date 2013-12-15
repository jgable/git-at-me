'use strict';

var Hooks = require('../lib/Hooks');

var hooks = new Hooks({
	token: require('../github-token'),
	user: 'jgable',
	repo: 'git-at-me',
	events: ['push', 'pull_request', 'issues'],
	server: {
		url: 'http://requestb.in/1jexn0p1'
	}
});

/*
hooks.get().then(function (hooks) {
	console.log('hooks', hooks);
});
*/


hooks.create().then(function (created) {
	console.log('created', created);
});
