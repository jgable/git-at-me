git-at-me
=========

Github provides a way for you to subscribe to [Web Hooks](https://help.github.com/articles/creating-webhooks) (they will POST data to a url you specify) for certain events on your repo.  Unfortunately, creating a Web Hook for Pull Requests [is more complex than necessary](https://gist.github.com/bjhess/2726012).  Git-at-me should handle most of the pain points including generating a token from the command line and starting up a server to listen for notifications with minimal configuration.

## Getting Started

```javascript
var github = require('git-at-me'),
    server = require('express')();

github({
    token: require('./github-token'),
    user: 'jgable',
    repo: 'git-at-me',
    // http://developer.github.com/v3/repos/hooks/#events
    events: ['push', 'pull_request', 'issues', 'release'],
    // The URL that github will post to; should match your site url
    url: 'http://mycoolsite.com/git-at-me/events',
    // More options for configuration documented below
    server: server
}).on('push', function (pushInfo) {
    // Do something with commits
}).on('pull_request', function (prInfo) {
    // Do something with PR
}).on('issue', function (issueInfo) {
    // Do something with issue
}).on('release', function (releaseInfo) {
    // Do something with release
});

/* **Snip all the express configuration** */

server.get('index', function (req, res) {
    res.render('index'); 
});

server.listen();
```

## Getting an API Token

If you don't pass an `auth` value, git-at-me will attempt to create one for you by asking for your GitHub username and password.  The username and password are not stored, but the token will be saved to a file that you can require later (defaults to `github-token.js` in the current working directory).

If you specify a relative path to a module that exports an API token, it will be used as well.

If you want to do it manually, I've included a simple [inquirer](https://github.com/SBoudrias/Inquirer.js) driven wizard to help with creating tokens and hooks.  This is handy if you don't have access to the Repo you want to add a hook to; just tell the owner of the Repo to run this script to create the necessary web hook.

```js
var gitatme = require('git-at-me');

// This will guide you through making a Token and a Hook for your Repo.
gitatme.wizard();
```

Check the [GitHub API Docs](http://developer.github.com/v3/oauth/#create-a-new-authorization) for more information about using the API for authorizations.

## Express Server Configuration

By default, git-at-me can create and start an express server, but if you want to pass your own (like from a Hubot.server for instance) you can pass that instead of the server config object.

```javascript
var github = require('git-at-me');

github({
    token: require('./github-token'),
    user: 'jgable',
    repo: 'git-at-me',
    events: ['push', 'pull_request', 'issues', 'release'],
    url: 'http://mycoolsite.com/git-at-me/events',
    // Passing port instead of server
    port: 3000
}).on('push', function (pushInfo) {
    // Do something with pushed commits
});
```

## License

Licensed under the MIT License, Copyright 2013-2014 Jacob Gable.