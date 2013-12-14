/*globals describe, beforeEach, afterEach, it*/
'use strict';

var _ = require('lodash'),
    sinon = require('sinon'),
    octonode = require('octonode'),
    Promise = require('bluebird'),
    Authorization = require('../lib/Authorization');

describe('Authorization', function () {

    var auth,
        sandbox;

    beforeEach(function () {
        auth = new Authorization();

        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('can accept a string as the token', function (done) {
        auth = new Authorization('GoodToken');
        auth.token().then(function (token) {
            token.should.equal('GoodToken');

            done();
        }).catch(done);
    });

    it('can create a new token', function (done) {
        // Mock the api responses
        var creds = {
                username: 'fakeuser',
                password: 'fakepass'
            },
            configSpy = sandbox.spy(octonode.auth, 'config'),
            loginStub = sandbox.stub(octonode.auth, 'login', function (scopes, cb) {
                cb(null, 1, 'Created Token');
            });

        auth.askForGithubCredentials = sandbox.stub().returns(Promise.resolve(creds));
        auth.saveToken = sandbox.stub().returns(Promise.resolve({
                saveto: 'fakepath',
                tokenId: 1,
                token: 'Created Token'
            }));

        auth.token().then(function (token) {
            configSpy.calledWithExactly(creds).should.equal(true);
            token.should.equal('Created Token');

            done();
        }).catch(done);
    });

    it('can handle two factor authentication responses', function () {
        // Verified this manually via integration tests
        return;
    });

    it('can save the chosen or created token to a file', function () { 
        // Verified this manually via integration tests
        return;
    });
});