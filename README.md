# express-session-cloudflare-kv

A cloudflare (workers) KV-based [express session](https://github.com/expressjs/session) store.

This session store use Cloudflare API from Node.js application.

- [Cloudflare API v4 Documentation](https://api.cloudflare.com/#workers-kv-namespace-properties)
- [KV · Cloudflare Workers docs](https://developers.cloudflare.com/workers/runtime-apis/kv)

⚠️ You should not use this session store in production.
Cloudflare Workers KV is [eventually-consistent](https://developers.cloudflare.com/workers/learning/how-kv-works). So It is not suitable for session manager.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install express-session-cloudflare-kv

You also need to install express:

    npm install express express-session

## Usage

Requirements:

- accountId: cloudflare account id
- namespaceId: KV storage namespace Id
    - https://dash.cloudflare.com/{id}/workers/overview
- authEmail: cloudflare account email
    - https://dash.cloudflare.com/profile
- authKey: cloudflare Global API Key
    - https://dash.cloudflare.com/profile/api-tokens

```ts
const express = require("express");
const session = require("express-session");
const { createSessionStore } = require("express-session-cloudflare-kv");
const app = express();
app.use(session({
    store: createSession({
        // cloudflare account id
        accountId: process.env.CF_accountId,
        // cloudflare KV namespace **id** (not name)
        namespaceId: process.env.CF_namespaceId,
        // cloudflare account email
        authEmail: process.env.CF_authEmail,
        // cloudflare API Key(probabely require Global Key)
        authKey: process.env.CF_authKey
    }),
    secret: "xxx",
    resave: false,
    saveUninitialized: true
}));
// Access the session as req.session
app.get('/', function(req, res, next) {
    console.log("req.session.id", req.session.id);
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        res.end()
    } else {
        req.session.views = 1
        res.end('welcome to the session demo. refresh!')
    }
})

app.listen(8000, () => {
    console.log("http://localhost:8000");
});
```

### Options

```ts
export type CreateSessionOptions = {
    // cloudflare account id
    accountId: string;
    // KV storage namespace Id
    namespaceId: string;
    // cloudflare account email
    authEmail: string;
    // cloudflare Global API Key
    authKey: string;
    // https://developers.cloudflare.com/workers/runtime-apis/kv#expiring-keys
    // Set its "expiration", using an absolute time specified in a number of seconds since the UNIX epoch
    expiration?: number;
    // Set its "expiration TTL" (time to live), using a relative number of seconds from the current time. For example, if you wanted a key to expire 10 minutes after creating it, you would set its expiration TTL to 600.
    expirationTtl?: number;
};
```

## Changelog

See [Releases page](https://github.com/azu/express-session-cloudflare-kv/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/express-session-cloudflare-kv/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- azu: [GitHub](https://github.com/azu), [Twitter](https://twitter.com/azu_re)

## License

MIT © azu
