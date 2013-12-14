'use strict';

var path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	inquirer = require('inquirer'),
	octonode = require('octonode'),
	Promise = require('bluebird');

var Authorization = function (authValue) {
	this.authValue = authValue;
};

_.extend(Authorization.prototype, {

	token: function () {
		if (_.isString(this.authValue)) {
			return Promise.resolve(this.authValue);
		}

		var tokenFile = this.tryGithubTokenFile(this.authValue);
		if (tokenFile) {
			return Promise.resolve(tokenFile);
		}

		return this.retrieveToken();
	},

	tryGithubTokenFile: function (filePath) {
		filePath = filePath || 'github-token.js';

		var tokenFile;

		try {
			tokenFile = require(path.join(process.cwd(), filePath));
		} catch(ignore) { }

		return tokenFile;
	},

	retrieveToken: function () {
		var self = this,
			// Shared between handlers
			githubCredentials,
			// A small promisified wrapper around getting the token using octonode
			getGithubToken = function (credentials) {
				octonode.auth.config(credentials);

				var authRequestData = {
						scopes: ['gist', 'repo'],
						// TODO: Include current working directory name or something instead of date?
						note: 'git-at-me created on ' + (new Date().toDateString())
					},
					getAuthToken = Promise.promisify(octonode.auth.login, octonode.auth);

				return getAuthToken(authRequestData);
			};

		return this.askForGithubCredentials().then(function (credentials) {
			// Store for later in case two-factor auth needs it
			githubCredentials = credentials;

			return getGithubToken(credentials);
		}).catch(function (e) {
			if (e.message && e.message.match(/two-factor authentication/)) {
				return self.askForTwoFactorAuthCode().then(function (otp) {
					var credentials = _.extend(githubCredentials, {
						otp: otp
					});

					return getGithubToken(credentials);
				});
			}
		}).spread(function (tokenId, token) {
			return self.saveToken(tokenId, token);
		}).then(function (saveDetails) {
			return saveDetails.token;
		});
	},

	askForGithubCredentials: function () {
		var defer = Promise.defer();

		inquirer.prompt([{
			name: 'username',
			type: 'input',
			// TODO: Default to current username of process
			message: 'Github Username'
		}, {
			name: 'password',
			type: 'password',
			message: 'Github Password'
		}], function (answers) {
			defer.resolve(answers);
		});

		return defer.promise;
	},

	askForTwoFactorAuthCode: function () {
		var def = Promise.defer();

		inquirer.prompt([{
			name: 'otp',
			type: 'input',
			message: 'Two Factor Auth Code'
		}], function (answers) {
			def.resolve(answers.otp);
		});

		return def.promise;
	},

	saveToken: function (tokenId, token) {
		var defer = Promise.defer();

		inquirer.prompt([{
			name: 'saveto',
			type: 'input',
			default: 'github-token.js',
			message: 'Save token as (relative to current working directory)'
		}], function (answers) {
			var savePath = path.join(process.cwd(), answers.saveto),
				saveFile = Promise.promisify(fs.writeFile, fs),
				contentTemplate = _.template('"use strict";\n\n// Saved by git-at-me on <%= date %>\n// Token Id: <%= tokenId %>\nmodule.exports = "<%= token %>";'),
				contents = contentTemplate({
					tokenId: tokenId,
					token: token,
					date: new Date().toLocaleString()
				});

			return saveFile(savePath, contents).then(function () {
				defer.resolve({
					savedto: savePath,
					tokenId: tokenId,
					token: token
				});
			});
		});

		return defer.promise;
	}
});

module.exports = Authorization;