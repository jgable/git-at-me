'use strict';

var inquirer = require('inquirer'),
    GitAtMe = require('./lib/GitAtMe'),
    wrapper = function (config) {
        var gitatme = new GitAtMe(config);

        return gitatme.start();
    };

wrapper.generators = require('./generators');

wrapper.wizard = function () {
    inquirer.prompt([{
        name: 'which',
        type: 'list',
        choices: ['Token', 'Hook', 'Nothing (exit)'],
        default: 'Token',
        message: 'What would you like to generate'
    }], function (answers) {
        if (answers.which === 'Nothing (exit)') {
            process.exit(0);
        } else if (answers.which === 'Token') {
            return wrapper.generators.token().then(function (token) {
                console.log('Token:', token);
                wrapper.wizard();
            });
        }

        inquirer.prompt([{
            name: 'token',
            type: 'input',
            message: 'Github Token'
        }, {
            name: 'repo',
            type: 'input',
            message: 'Github Repo (e.g. jgable/git-at-me)'
            // TODO: Validate
        }, {
            name: 'events',
            type: 'checkbox',
            message: 'Repo Events to Subscribe',
            choices: [
                { name: 'push', checked: true },
                { name: 'issues', checked: true },
                { name: 'issue_comment' },
                { name: 'commit_comment' },
                { name: 'create' },
                { name: 'delete' },
                { name: 'pull_request', checked: true },
                { name: 'pull_request_review_comment' },
                { name: 'gollum' },
                { name: 'watch' },
                { name: 'release', checked: true },
                { name: 'fork' },
                { name: 'member' },
                { name: 'public' },
                { name: 'team_add' },
                { name: 'status' }
            ],
            validate: function (answer) {
                if (answers.length < 1) {
                    return 'You must select at least one event to subscribe to';
                }

                return true;
            }
        }, {
            name: 'url',
            type: 'input',
            message: 'URL that GitHub should POST to on Event'
        }], function (answers) {
            var parts = answers.repo.split('/'),
                config = {
                    token: answers.token,
                    user: parts[0],
                    repo: parts[1],
                    events: answers.events,
                    url: answers.url
                };

            wrapper.generators.hook(config).then(function () {
                wrapper.wizard();
            });
        });
    });
};

module.exports = wrapper;