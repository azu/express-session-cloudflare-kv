var express = require("express");
var session = require("express-session");
var app = express();
var { createSessionStore } = require("./lib/express-session-cloudflare-kv");

const env = require("./.env.json");
app.use(
    session({
        store: createSessionStore({
            accountId: env.accountId,
            namespaceId: env.namespaceId,
            authEmail: env.authEmail,
            authKey: env.authKey
        }),
        secret: "t5sEIUY72Ens",
        resave: false,
        saveUninitialized: true
    })
);
// Access the session as req.session
app.get("/", function (req, res, next) {
    console.log("req.session.id", req.session.id);
    if (req.session.views) {
        req.session.views++;
        res.setHeader("Content-Type", "text/html");
        res.write("<p>views: " + req.session.views + "</p>");
        res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
        res.end();
    } else {
        req.session.views = 1;
        res.end("welcome to the session demo. refresh!");
    }
});

app.listen(8000, () => {
    console.log("http://localhost:8000");
});
