'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    url = require('url'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    express;

var Server = function (config) {
    // Ensure our 'this' context
    _.bindAll(this, ['handleEventPOST']);

    this.initialize(config);
};

// Inherit from EventEmitter
util.inherits(Server, EventEmitter);

_.extend(Server.prototype, {
    initialize: function (config) {
        var parsedUrl;

        this.config = _.pick(config, 'url', 'server', 'port');

        if (!(this.config.server || this.config.port)) {
            throw new Error('Must provide either an existing server or port number to start a new one on');
        }

        try {
            parsedUrl = url.parse(this.config.url);
        } catch(e) {
            throw new Error('Invalid URL');
        }

        this.routePath = parsedUrl.pathname || '/';
    },

    ensureServer: function () {
        var self = this;

        // Handle the simple case where a server is passed in first
        if (this.config.server) {
            this.registerRoutes(this.config.server);
            return Promise.resolve(this.config.server);
        }

        // Try to get the express module so we can create a server
        try {
            express = require('express');
        } catch(e) {
            throw new Error('Could not find express module; please install using `npm install express`');
        }

        // Create a new server and store it as this.config.server
        var server = this.config.server = express(),
            def = Promise.defer();

        // Use the json middleware to parse the POSTed data
        server.use(express.json());

        this.registerRoutes(server);

        server.listen(this.config.port, function (err) {
            if (err) {
                return def.reject(err);
            }

            def.resolve(server);
        });

        return def.promise;
    },

    registerRoutes: function (server) {
        server.post(this.routePath, this.handleEventPOST);
    },

    handleEventPOST: function (req, res) {
        var eventName = req.headers['X-Github-Event'] || 'unknown';

        try {
            this.emit(eventName, req.body);    
        } catch(e) {
            this.emit('error', e);

            if (e.handled) {
                return res.send(200);
            }

            return res.send(500);
        }

        res.send(200);
    }
});

module.exports = Server;