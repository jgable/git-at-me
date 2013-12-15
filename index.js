'use strict';

var GitAtMe = require('./lib/GitAtMe');

module.exports = function (config) {
	var gitatme = new GitAtMe(config);

	return gitatme.start();
};