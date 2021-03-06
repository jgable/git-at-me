'use strict';

var _ = require('lodash'),
    octonode = require('octonode'),
    Promise = require('bluebird');

var Hooks = function (config) {
    this.initialize(config);
};

_.extend(Hooks.prototype, {
    initialize: function (config) {
        this.config = _.pick(config, 'token', 'user', 'repo', 'events', 'url');
        
        var client = octonode.client(this.config.token),
            repoName = [this.config.user, this.config.repo].join('/');
        
        this.repo = client.repo(repoName);
    },

    get: function () {
        return Promise.promisify(this.repo.hooks, this.repo)().spread(function (hooks) {
            return Promise.resolve(hooks);
        });
    },

    create: function () {
        var self = this;

        // Grab all the hooks to check if it already exists
        return this.get().then(function (hooks) {
            // Check for an existing hook
            var existingHook = _.find(hooks, function (hook) {
                return hook.config.url === self.config.url;
            });

            if (existingHook) {
                return Promise.resolve(existingHook);
            }

            // Create the hook if not one already
            return self._createGithubHook();
        });
    },

    _createGithubHook: function () {
        return Promise.promisify(this.repo.hook, this.repo)({
            name: 'web',
            active: true,
            events: this.config.events,
            config: {
                url: this.config.url,
                content_type: 'json'
            }
        }).spread(function (hook) {
            return hook;
        });
    }
});

module.exports = Hooks;