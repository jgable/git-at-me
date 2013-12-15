'use strict';

var Auth = require('./lib/Authorization'),
    Hooks = require('./lib/Hooks');

module.exports = {
    token: function () {
        var auth = new Auth();

        return auth.token().then(function (token) {
            console.log('Token saved!');

            return token;
        });
    },

    hook: function (config) {
        var auth = new Auth(config.token);

        return auth.token().then(function (token) {
            config.token = token;

            var hooks = new Hooks(config);

            return hooks.create();
        }).then(function (hook) {
            console.log('Hook Created!');

            return hook;
        }).catch(function (e) {
            console.log('Error creating Hook: ' + e.message);
        });
    }
}