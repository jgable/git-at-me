git-at-me
=========

Yet another Github Webhook thingy for Node.

## Getting Started

```javascript
var github = require('git-at-me');

github({
    auth: require('./.github-token'),
    user: 'jgable',
    repo: 'git-at-me',
    // http://developer.github.com/v3/repos/hooks/#events
    events: ['push', 'pull_request', 'issues', 'release'],
    server: {
        port: 3000,
        url: 'http://mycoolsite.com/git-at-me/events'
    }
}).on('push', function (pushInfo) {
    // Do something with commits
}).on('pull_request', function (prInfo) {
    // Do something with PR
}).on('issue', function (issueInfo) {
    // Do something with issue
}).on('release', function (releaseInfo) {
    // Do something with release
});
```

## Getting an API Token

If you don't pass an `auth` value, git-at-me will attempt to create one for you to use by asking for your Github username and password.  The username and password are not stored, but the token will be saved to a file that you can require later (defaults to `github-token.js` in the current working directory).

If you specify a relative path to a module that exports an API token, it will be used as well.

If you want to do it manually, you can create an API token to use from the Github user settings page, or from the command line like this:

```shell
curl -v -u jgable -X POST https://api.github.com/authorizations --data '{"scopes":["gist","repo"]}'
```

Check the [Github API Docs](http://developer.github.com/v3/oauth/#create-a-new-authorization) for more information about using the API for authorizations.

## Using an existing Express server

By default, git-at-me can create and start an express server, but if you want to pass your own (like from a Hubot.server for instance) you can pass that instead of the server config object.

```javascript
var github = require('git-at-me'),
    express = require('express');

var server = express();

server.get('/', function (req, res) {
    res.render('index');
});

/* snip other express configuration */

github({
    auth: require('./.github-token'),
    user: 'jgable',
    repo: 'git-at-me',
    events: ['push', 'pull_request', 'issues', 'release'],
    server: {
        express: server,
        url: 'http://mycoolsite.com/git-at-me/events'
    }
}).on('push', function (pushInfo) {
    // Do something with pushed commits
});
```

## License

Licensed under the MIT License, Copyright 2013-2014 Jacob Gable.