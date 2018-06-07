"use strict";

var express = require("express"),
    session = require("express-session"),
    compression = require("compression"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    redis = require("redis"),
    connectRedis = require("connect-redis"),
    cons = require("consolidate"),
    util = require("util"),
    fs = require("fs"),

    app = express(),
    http = require("http").Server(app),
    sslPrivateKey  = fs.readFileSync("./server/ssl/server.key", "utf8"),
    sslCertificate = fs.readFileSync("./server/ssl/server.crt", "utf8"),
    https = require("https"),
    statements = require("yargs").argv,
    RedisStore, RedisClient;

//RedisStore = connectRedis(session);
//RedisClient = redis.createClient();


// Use compress middleware to gzip content.
// That will return elements compressed with gzip if they"re HTML, CSS, JavaScript, or JSON.
// (should be placed before express.static)
app.use(compression());

//// create a redis client to verify if the redis server is running correctly
//RedisClient.on("ready", function () {
//    util.log("Redis server is running correctly on port 6379.");
//});
//
//RedisClient.on("error", function (err) {
//    util.error(err);
//    util.log("Redis Server is not running, please refer to README.md");
//    process.exit();
//});
var buildFolder = process.env.NODE_ENV === "production" ? "dist" : "build";

util.log("Environment: " + (process.env.NODE_ENV || "development") + ".");
util.log("Using: " + buildFolder + " folder.");


// set default express engine to underscore
app.engine("html", cons.underscore);
app.set("view engine", "html");

// set up the app folder as the main view folder
// the files are taken from build and server folders
app.set("views", process.cwd() + "/server/views");

// set static paths for assets
app.use("/server-assets", express.static(process.cwd() + "/server/assets"));
app.use("/server-uploads", express.static(process.cwd() + "/server/upload"));

// expose the assets under development url as well to simplify the paths
app.use("/development/tests/assets", express.static(process.cwd() + "/" + buildFolder + "/assets"));

// implement session, so the user won't get disconnected after the
// server is restarted, useful for development
//app.use(session({
//    store: new RedisStore({
//        client : RedisClient
//    }),
//    // https://www.npmjs.org/package/express-session
//    // don't force the session to be resaved when unmodified
//    resave: false,
//    saveUninitialized: true,
//    secret: "gistExplorer",
//    cookie: {
//        maxAge: 600000000
//    }
//}));


//mockStore.init({ redisClient : RedisClient });

// parse the request body, useful for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use("/rest", require("./routes/api/authenticate.route"));
app.use("/rest", require("./routes/api/gists.route"));
app.use("/rest", require("./routes/api/user.route"));


app.use("/", require("./routes/index.route"));

app.use('/', express.static('build'));
app.use('/assets', express.static('build/assets'));
app.use('/subapps', express.static('build/assets/js/app/subapps'));
app.use('/services', express.static('build/assets/js/app/services'));
app.use('/common', express.static('build/assets/js/app/common'));


app.use('/node_modules', express.static('node_modules'));

//app.use(errorHandler);
// check if the build folder exists
// you need to use `gulp watch` before `npm start` to successfully start the dev environment

app.listen(8000, function () {
    util.log("HTTP Server is running on port 8000.");
});


// HTTPS
https.createServer({
    key: sslPrivateKey,
    cert: sslCertificate
}, app).listen(8443, function () {
    util.log("HTTPS Server is running on port 8443.");
});

