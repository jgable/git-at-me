/*globals describe, beforeEach, afterEach, it*/
'use strict';

var _ = require('lodash'),
    sinon = require('sinon'),
    should = require('should'),
    octonode = require('octonode'),
    Promise = require('bluebird'),
    express = require('express'),
    Server = require('../lib/Server');

describe('Server', function () {

    var server,
        sandbox;

    beforeEach(function () {
        server = new Server({
            url: 'http://example.com/github/events',
            port: 1234
        });

        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('is an EventEmitter', function () {
        _.isFunction(server.on).should.equal(true);
    });

    it('requires either an existing server or port number', function () {
        var badInitialize = function () {
                server.initialize({
                    url: server.config.url
                });
            };

        badInitialize.should.throw('Must provide either an existing server or port number to start a new one on');
    });

    it('can parse the url for the route to register', function () {
        server.routePath.should.equal('/github/events');

        // Also test for no path at end
        server.initialize({
            port: 3000,
            url: 'http://example.com'
        });

        server.routePath.should.equal('/');
    });

    it('can use an existing express server', function (done) {
        var expressServer = express();

        server.initialize({
            server: expressServer,
            url: 'http://example.com/github/events'
        });

        var routeSpy = sandbox.spy(server, 'registerRoutes'),
            postSpy = sandbox.spy(expressServer, 'post');

        server.ensureServer().then(function (ensured) {
            ensured.should.equal(expressServer);

            routeSpy.calledWithExactly(expressServer).should.equal(true);
            postSpy.calledWith('/github/events').should.equal(true);

            done();
        }).catch(done);
    });

    it('can start a new express server', function (done) {
        server.ensureServer().then(function (created) {
            should.exist(created);

            var routeExists = _.any(created.routes.post, function (route) {
                return route.path === '/github/events';
            });

            routeExists.should.equal(true);

            done();
        }).catch(done);
    });

    it('emits events when data is POSTed to it', function (done) {
        var fakeRequest = {
                headers: {
                    'X-Github-Event': 'push'
                },
                /* jslint quotmark: false */
                body: {"ref":"refs/heads/master","after":"3722cee576e159dea70464a948f1e0adb29334c4","before":"b29e18b9b2dbab113e79f64bde9f6be580fe3bc2","created":false,"deleted":false,"forced":false,"compare":"https://github.com/jgable/git-at-me/compare/b29e18b9b2db...3722cee576e1","commits":[{"id":"a8fa6ff7131b7a2a96b0db3e493b2c93bc7a5a2e","distinct":true,"message":"Authorization\n\n- Adding Authorization class and tests\n- Add auto detection of github-token.js\n- Integration test for Authorization token retrieval","timestamp":"2013-12-14T13:35:52-08:00","url":"https://github.com/jgable/git-at-me/commit/a8fa6ff7131b7a2a96b0db3e493b2c93bc7a5a2e","author":{"name":"Jacob Gable","email":"jacob.gable@gmail.com","username":"jgable"},"committer":{"name":"Jacob Gable","email":"jacob.gable@gmail.com","username":"jgable"},"added":[".jshintrc","Gruntfile.js","index.js","lib/Authorization.js","package.json","test/authorization_integration.js","test/authorization_spec.js","test/example.js"],"removed":[],"modified":[".gitignore","README.md"]},{"id":"3722cee576e159dea70464a948f1e0adb29334c4","distinct":true,"message":"Add two factor authentication support","timestamp":"2013-12-14T14:56:01-08:00","url":"https://github.com/jgable/git-at-me/commit/3722cee576e159dea70464a948f1e0adb29334c4","author":{"name":"Jacob Gable","email":"jacob.gable@gmail.com","username":"jgable"},"committer":{"name":"Jacob Gable","email":"jacob.gable@gmail.com","username":"jgable"},"added":[],"removed":[],"modified":["README.md","lib/Authorization.js","test/authorization_integration.js","test/authorization_spec.js"]}],"head_commit":{"id":"3722cee576e159dea70464a948f1e0adb29334c4","distinct":true,"message":"Add two factor authentication support","timestamp":"2013-12-14T14:56:01-08:00","url":"https://github.com/jgable/git-at-me/commit/3722cee576e159dea70464a948f1e0adb29334c4","author":{"name":"Jacob Gable","email":"jacob.gable@gmail.com","username":"jgable"},"committer":{"name":"Jacob Gable","email":"jacob.gable@gmail.com","username":"jgable"},"added":[],"removed":[],"modified":["README.md","lib/Authorization.js","test/authorization_integration.js","test/authorization_spec.js"]},"repository":{"id":15191330,"name":"git-at-me","url":"https://github.com/jgable/git-at-me","description":"Yet another Github Webhook thing","watchers":0,"stargazers":0,"forks":0,"fork":false,"size":148,"owner":{"name":"jgable","email":"jacob.gable@gmail.com"},"private":false,"open_issues":0,"has_issues":true,"has_downloads":true,"has_wiki":true,"language":"JavaScript","created_at":1387048458,"pushed_at":1387063778,"master_branch":"master"},"pusher":{"name":"none"}}
                /* jslint quotmark: true */
            },
            fakeResponse = {
                send: sandbox.stub()
            };

        server.on('push', function (data) {
            data.should.equal(fakeRequest.body);
            
            // Have to wait for the emit to finish before it sends the response
            _.defer(function () {
                fakeResponse.send.calledWith(200).should.equal(true);

                done();
            });
        });

        server.handleEventPOST(fakeRequest, fakeResponse);
    });
});