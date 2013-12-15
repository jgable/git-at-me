/*globals describe, beforeEach, afterEach, it*/
'use strict';

var _ = require('lodash'),
    sinon = require('sinon'),
    octonode = require('octonode'),
    Promise = require('bluebird'),
    Hooks = require('../lib/Hooks');

describe('Hooks', function () {

    var hooks,
        sandbox;

    beforeEach(function () {
        hooks = new Hooks({
            auth: 'testtoken',
            user: 'testuser',
            repo: 'testsite',
            events: ['push', 'pull_request', 'issues'],
            url: 'http://example.com/github/events'
        });

        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('can get existing hooks on a repo', function (done) {
        var hooksStub = sandbox.stub(hooks.repo, 'hooks', function (cb) {
            _.defer(function () {
                cb(null, [{id: 'test', config: { url: 'http://example.com/github/events'}}], {});
            });
        });

        hooks.get().then(function (found) {
            hooksStub.callCount.should.equal(1);

            found.length.should.equal(1);
            found[0].id.should.equal('test');
            found[0].config.url.should.equal(hooks.config.url);

            done();
        }).catch(done);
    });

    it('can register a new hook on a repo', function (done) {
        var hooksStub = sandbox.stub(hooks.repo, 'hooks', function (cb) {
            _.defer(function () {
                cb(null, [{id: 'other', config: { url: 'http://othersite.com/github/events'}}], {});
            });
        });

        var hookCreateStub = sandbox.stub(hooks.repo, 'hook', function (hookInfo, cb) {
            _.defer(function () {
                cb(null, {id: 'test', config: { url: 'http://example.com/github/events'}}, {});
            });
        });

        hooks.create().then(function (created) {
            hooksStub.callCount.should.equal(1);

            hookCreateStub.callCount.should.equal(1);

            var call = hookCreateStub.getCall(0);
            call.args[0].name.should.equal('web');
            call.args[0].active.should.equal(true);
            call.args[0].events.should.equal(hooks.config.events);
            call.args[0].config.url.should.equal(hooks.config.url);

            created.id.should.equal('test');
            created.config.url.should.equal(hooks.config.url);

            done();
        }).catch(done);
    });

    it('does not register a new hook if it already exists', function (done) {
        var hooksStub = sandbox.stub(hooks.repo, 'hooks', function (cb) {
            _.defer(function () {
                cb(null, [{id: 'existed', config: { url: 'http://example.com/github/events'}}], {});
            });
        });

        var hookCreateStub = sandbox.stub(hooks.repo, 'hook', function (hookInfo, cb) {
            _.defer(function () {
                cb(null, {id: 'test', config: { url: 'http://example.com/github/events'}}, {});
            });
        });

        hooks.create().then(function (created) {
            hooksStub.callCount.should.equal(1);

            hookCreateStub.callCount.should.equal(0);

            created.id.should.equal('existed');
            created.config.url.should.equal(hooks.config.url);

            done();
        }).catch(done);
    });
});