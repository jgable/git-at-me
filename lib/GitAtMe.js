'use strict';

var _ = require('lodash'),
    Authorization = require('./Authorization'),
    Hooks = require('./Hooks'),
    Server = require('./Server');

var GitAtMe = function (config) {
    this.initialize(config);
};

_.extend(GitAtMe.prototype, {
    initialize: function (config) {
        this.config = config;

        this.auth = new Authorization(this.config.token);

        this.server = new Server(this.config);
    },

    start: function () {
        var self = this;

        this.auth.token().then(function (token) {
            self.config.token = token;

            self.server.emit('token', token);

            self.hooks = new Hooks(self.config);

            return self.hooks.create();
        }).then(function (hook) {
            self.server.emit('hook', hook);

            return self.server.ensureServer();
        }).then(function (server) {
            self.server.emit('server', server);
        });

        // Return the event emitter for binding
        return this.server;
    }
});

module.exports = GitAtMe;