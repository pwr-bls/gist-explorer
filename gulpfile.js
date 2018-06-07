/* globals process, require */

"use strict";

var gulp = require("gulp"),
    runseq = require("run-sequence"),
    less = require("gulp-less"),
    jshint = require("gulp-jshint"),
    plumber = require("gulp-plumber"),
    template = require("gulp-template"),
    rename = require("gulp-rename"),
    changed = require("gulp-changed"),
    sourcemaps = require("gulp-sourcemaps"),
    gulpif = require("gulp-if"),
    zip = require("gulp-zip"),
    autoprefixer = require("gulp-autoprefixer"),
    htmlclean = require("gulp-htmlclean"),
    jsonmin = require("gulp-jsonmin"),
    requirejs = require("requirejs"),
    glob = require("glob"),
    util = require("gulp-util"),
    _ = require("underscore"),
    del = require("del"),
    async = require("async"),
    karma = require("karma"),
    argv = require("yargs").argv,
    moment = require("moment"),
    path = require("path"),
    settings = require("./package.json"),
    fs = require("fs"),
    karmaConfig = require("karma/lib/config"),
    htmlreplace = require("gulp-html-replace"),
    foreach = require("gulp-foreach"),
    builder = require("./gulp/helpers/builder.helper"),
    template2jst = require("./gulp/helpers/template2jst.helper"),
    json2js = require("./gulp/helpers/json2js.helper"),
    regexReplace = require("./gulp/helpers/regexReplace.helper");

var isProduction = _.intersection(process.argv, ["production"]).length > 0,
    specRegexp = util.env.spec || false,
    specUnit = util.env.unit || false, // set --unit if you want every spec run spearately
    testWatch = util.env.watch || false,
// watchTests = util.env.watchTests || false,
    beepOnError = util.env.beep || false,
    DONT_STOP_ON_ERRORS = true,
    watchOpt = util.env.interval ? {interval: util.env.interval} : {interval: 600},
    supportedBrowsers = ["> 1%", "last 3 versions", "Firefox ESR", "Opera 12.1", "IE >= 9"],
    development,
    developmentDynamo,
    watchFilesAndReact,
    watchDynamoFilesAndReact;

function errorHandler(err) {
    util.log(err);
    if (DONT_STOP_ON_ERRORS) {
        this.emit("end");
    } else {
        process.exit(1);
    }
}

function readFile(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return fs.readFileSync(filePath, "utf8");
        } catch (err) {
            errorHandler(err);
        }
    }
    return "";
}

function plumberErrorHandler(err) {
    if (beepOnError) {
        util.beep();
    }

    util.log(util.colors.red(err));
    if (DONT_STOP_ON_ERRORS) {
        this.emit("end");
    } else {
        process.exit(1);
    }
}

function watch(glob, opt, fn) {
    // use global opts if opt is not passed
    if (typeof opt === "function" || Array.isArray(opt)) {
        fn = opt;
        opt = watchOpt;
    }
    return gulp.watch(glob, opt, fn);

}

function getConfigFilePath () {
    if (isProduction) {
        return "src/assets/js/app/config.prod.js";
    }

    return "src/assets/js/app/config.js";
}

var paths = {
    template: ["src/assets/js/**/templates/*.html", "src/assets/js/**/templates/**/*.html"]
};

var buildPaths = {
    template: ["build/assets/js/**/templates/*.html", "build/assets/js/**/templates/**/*.html"]
};

// Delete the build directory
gulp.task("clean", function (callback) {
    return del(["build", "dist", "env.properties"], function (err) {
        if (err) {
            errorHandler(err);
        }
        callback();
    });
});

/* standard tasks */

gulp.task("config", function () {
    var filename = getConfigFilePath();

    return gulp.src(filename)
        .pipe(rename("config.js"))
        .pipe(gulp.dest("build/assets/js/app"))
        .on("error", errorHandler);
});

// Start watching specs and call runner when something changed in src/assets/js/spec/**/*.spec.js
// Using --spec you can select spec files matching the regexp pattern. Only the spec files
// matching the regexp will be included in runner.
//
// example: gulp runner-watch --spec subapp/screen
// will include all specs where spec full path includes the subapp/screen part
//
// example: gulp runner-watch --spec subapps/screen.*\.controller\.spec\.js$
// will include all files with subapps/screen string in path and ending with .controller.spec.js
gulp.task("runner-watch", ["js", "runner"], function () {
    watch(["src/assets/js/spec/**/*.spec.js"], ["js", "runner"]);
});

gulp.task("runner", function () {
    var SPEC_REGEXP = new RegExp(specRegexp || ".spec.js$"),
        specs = [];
    glob("src/assets/js/spec/**/*.spec.js", function (err, files) {

        // It's madness, madness I tell you!
        //files = _.shuffle(files);

        files.forEach(function (file) {
            if (SPEC_REGEXP.test(file)) {
                specs.push(file.split("src/")[1]);
            }
        });

        return gulp.src("src/runner.html")
            .pipe(template({
                specs: JSON.stringify(specs)
            }))
            .pipe(gulp.dest("build/"))
            .on("error", errorHandler);
    });
});

// convert less to css
gulp.task("less-bootstrap", function () {
    return gulp.src("src/assets/less/vendor/bootstrap/3.3.0/bootstrap.less")
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: supportedBrowsers,
            cascade: false,
            remove: true
        }))
        .pipe(gulpif(!isProduction, sourcemaps.write("./maps")))
        .pipe(gulp.dest("build/assets/css/"))
        .on("error", errorHandler);
});
gulp.task("less", function () {
    // main.less imports all other files
    return gulp.src([
        "src/assets/less/main.less"
    ])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: supportedBrowsers,
            cascade: false,
            remove: true
        }))
        .pipe(gulpif(!isProduction, sourcemaps.write("./maps")))
        .pipe(gulp.dest("build/assets/css/"))
        .on("error", errorHandler);
});

gulp.task("less-plumbed", function () {
    // main.less imports all other files
    return gulp.src([
        "src/assets/less/main.less"
    ])
        .pipe(plumber({
            errorHandler: plumberErrorHandler
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: supportedBrowsers,
            cascade: false,
            remove: true
        }))
        .pipe(gulpif(!isProduction, sourcemaps.write("./maps")))
        .pipe(gulp.dest("build/assets/css/"));
});

// move css vendor libraries to build
gulp.task("css", function () {
    return gulp.src("src/assets/css/**/*")
        .pipe(changed("build/assets/css"))
        .pipe(gulp.dest("build/assets/css"))
        .on("error", errorHandler);
});

// lint the files
gulp.task("jshint", function () {
    return gulp.src(["src/assets/js/app/**/*.js"])
        // the following line makes dummy cache
        // which doesn't care if the file failed or not
        // it should be improved
        .pipe(changed("build/assets/js/app"))
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter())
        .pipe(jshint.reporter("fail"))
        .on("error", errorHandler);
});

gulp.task("jshint-plumbed", function () {
    return gulp.src("src/assets/js/app/**/*.js")
        // the following line makes dummy cache
        // which doesn't care if the file failed or not
        // it should be improved
        .pipe(changed("build/assets/js/app"))
        .pipe(plumber({
            errorHandler: plumberErrorHandler
        }))
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter())
        .pipe(jshint.reporter("fail"));
});

// move js files to build
gulp.task("js", function () {
    return gulp.src(["src/assets/js/**/*.js", "src/assets/js/**/*.map", "!src/assets/js/app/config.js", "!src/assets/js/app/config.prod.js"])
        .pipe(changed("build/assets/js"))
        .pipe(gulp.dest("build/assets/js"))
        .on("error", errorHandler);
});

gulp.task("json", function () {
    return gulp.src(["src/assets/json/**/*.json"])
        .pipe(changed("build/assets/json"))
        .pipe(jsonmin())
        .pipe(gulp.dest("build/assets/json"))
        .on("error", errorHandler);
});

gulp.task("xml", function () {
    return gulp.src(["src/assets/xml/**/*.xml"])
        .pipe(changed("build/assets/xml"))
        .pipe(gulp.dest("build/assets/xml"))
        .on("error", errorHandler);
});

// move locales files to build
gulp.task("locales", function () {
    return gulp.src("src/assets/locales/**/*.json")
        .pipe(changed("build/assets/locales"))
        .pipe(jsonmin())
        .pipe(gulp.dest("build/assets/locales"))
        .on("error", errorHandler);
});

gulp.task("locales2js", function () {
    return gulp.src("src/assets/locales/**/*.json")
        .pipe(jsonmin())
        .pipe(json2js())
        .pipe(gulp.dest("build/assets/js/app/locales"))
        .on("error", errorHandler);
});

// move js files to build
gulp.task("html", function () {
    return gulp.src(["src/**/*.html", "!src/runner.html", "!src/index.html"])
        .pipe(changed("build"))
        .pipe(regexReplace())
        .pipe(htmlclean())
        .pipe(gulp.dest("build"))
        .on("error", errorHandler);
});

// parse the index file and attach
// the package version and timestamp
gulp.task("index", function () {
    return gulp.src("src/index.html")
        .pipe(template({
            version: settings.version,
            date: moment().utc().format("YYYY-MM-DDTHH:mm:ss")
        }))
        .pipe(gulpif(isProduction, htmlreplace({
            "development": ""
        }, {
            keepUnassigned: true
        })))
        .pipe(htmlclean())
        .pipe(gulp.dest("build"))
        .on("error", errorHandler);
});

gulp.task("template2jst", function () {
    return gulp.src(paths.template)
        .pipe(changed("build/assets/js", {extension: ".jst.js"}))
        .pipe(gulpif(isProduction, htmlreplace({
            "development": ""
        }, {
            keepUnassigned: true
        })))
        .pipe(htmlclean())
        .pipe(template2jst())
        .pipe(gulp.dest("build/assets/js"))
        .on("error", errorHandler);
});

gulp.task("template2jst-single-file", function () {
    return gulp.src(argv.file, {base: "src"})
        .pipe(template2jst())
        .pipe(gulp.dest("build"))
        .on("error", errorHandler);
});

// move fonts to build
gulp.task("fonts", function () {
    return gulp.src("src/assets/fonts/**/*")
        .pipe(changed("build/assets/fonts"))
        .pipe(gulp.dest("build/assets/fonts"))
        .on("error", errorHandler);
});

gulp.task("images", function () {
    return gulp.src("src/assets/images/**/*")
        .pipe(changed("build/assets/images"))
        .pipe(gulp.dest("build/assets/images"))
        .on("error", errorHandler);
});

// Create file with env variables (current version number) for jenkins build number
gulp.task("jenkins-properties-file", function () {
    return fs.writeFile("env.properties", "APP_VERSION=" + settings.version, null, function (err) {
        if (err) {
            errorHandler(err);
        }
    });
});

// jenkins task, used to create a zip out of the build folder
gulp.task("zip-build", function () {
    // zip build, server and src
    return gulp.src([
        "!node_modules/**/*",
        "!reports/**/*",
        "!functional-tests/**/*",
        "!*.zip",
        "!sandbox/**/*",
        "!snippets/**/*",
        "!env.properties",
        "**/*"
    ])
        .pipe(zip("app.zip"))
        .pipe(gulp.dest(""));
});

// jenkins task, used to create a zip out of the dist folder
gulp.task("zip-dist", function () {
    return gulp.src("dist/**/*")
        .pipe(zip("app.zip"))
        .pipe(gulp.dest(""));
});

// jenkins task, used to create zip of production version for mock
gulp.task("zip-mock", function () {
    return gulp.src([
        "!node_modules/**/*",
        "!reports/**/*",
        "!functional-tests/**/*",
        "!*.zip",
        "!sandbox/**/*",
        "!snippets/**/*",
        "!env.properties",
        "!build/**/*",
        "**/*"
    ])
        .pipe(zip("app.zip"))
        .pipe(gulp.dest(""));
});

// jenkins task, used to create zip of functional tests
gulp.task("zip-functional-tests", function () {
    return gulp.src([
        "functional-tests/**/*"
    ])
        .pipe(zip("functional-tests.zip"))
        .pipe(gulp.dest(""));
});

// jenkins task, used to create zip of tomcat deploy scripts
gulp.task("zip-tomcat-deploy", function () {
    return gulp.src([
        "scripts/tomcat/deploy/**/*"
    ])
        .pipe(zip("tomcat-deploy.zip"))
        .pipe(gulp.dest(""));
});

// Start watching specs and call karma when something changed in src/assets/js/spec/**/*.spec.js
// Using --spec you can select spec files matching the regexp pattern. Only the spec files
// matching the regexp will be included in runner.
//
// example: gulp unit-watch --spec subapp/screen
// will include all specs where spec full path includes the subapp/screen part
//
// example: gulp unit-watch --spec subapps/screen.*\.controller\.spec\.js$
// will include all files with subapps/screen string in path and ending with .controller.spec.js
gulp.task("unit-watch", ["unit"], function () {
    watch(["src/assets/js/spec/**/*.spec.js"], ["unit"]);
});


var karmaRunner = function (specRegexp, done) {
    var Server = karma.Server,
        server,
        baseReporter = "progress",
        browsers = [argv.browser ? argv.browser : "PhantomJS"],
        paramReporter = argv.reporters,
        karmaConfigFile = path.resolve("karma.conf.js"),
        config;

    config = karmaConfig.parseConfig(karmaConfigFile, {
        singleRun: !testWatch,
        browsers: browsers,
        client: {
            captureConsole: true,
            specRegexp: specRegexp
        }
    });
    // replace base reporter with one passed as param
    if (paramReporter) {
        config.reporters.splice(config.reporters.indexOf(baseReporter), 1, paramReporter);
    }

    server = new Server(config, done);
    server.start();
};

var traverseSpecs = function (currentPath, regexp) {
    var files = fs.readdirSync(currentPath),
        result = [],
        currentFile, stats;

    _.each(files, function (file) {
        currentFile = currentPath + "/" + file;
        stats = fs.statSync(currentFile);
        if (stats.isFile()) {
            if (currentFile.match(regexp)) {
                // prepare the regexp for single spec
                result.push(currentFile.replace("src/assets/js/", ""));
            }
        } else if (stats.isDirectory()) {
            files = traverseSpecs(currentFile, regexp);
            result = result.concat(files);
        }
    });

    return result;
};

// Run karma tests
gulp.task("unit", ["js"], function (done) {
    var specsRegexp = specRegexp ?
        [specRegexp] :
        [
            // All
            "\\.spec\\.js",

            // TODO: Running the specs as a separate modules show us that
            // some unit tests are still not unit test.

            // Specs form spec/common (including all subcategories)
            //"spec/common/.*\\.spec\\.js",
            //
            // We can also divide spec/common by subdirecotries.
            //
            // Specs from spec/common (divided by directories)
            //"spec/common/[^\\/]+\\.spec\\.js",
            // Common Behaviors
            //"spec/common/behaviors/.*\\.spec\\.js",
            // Common Components
            //"spec/common/components/.*\\.spec\\.js",
            // Common Controller
            //"spec/common/controller/.*\\.spec\\.js",
            // Common Helpers
            //"spec/common/helpers/.*\\.spec\\.js",
            // Common Models
            //"spec/common/models/.*\\.spec\\.js",
            // Common Natives
            //"spec/common/natives/.*\\.spec\\.js",
            // Common Plugins
            //"spec/common/plugins/.*\\.spec\\.js",
            // Common Views
            //"spec/common/views/.*\\.spec\\.js",

            // Specs from spec/modules (including all subcategories)
            // Modules
            //"spec/modules/.*\\.spec\\.js",

            // Specs from spec/services (including all subcategories)
            // Services
            //"spec/services/.*\\.spec\\.js",

            // Specs from spec/subapps (including all subcategories)
            // Subapps
            //"spec/subapps/.*\\.spec\\.js"
        ], errors = [];


    async.eachSeries(specsRegexp, function (regexp, callback) {
        var specs = traverseSpecs("src/assets/js/spec", regexp);

        util.log("Testing " + util.colors.magenta(regexp) + "...");

        // Check specs availability
        if (specs.length === 0) {
            return callback("No spec found!");
        }

        util.log("Specs to test: " + specs.length + "...");
        if (specUnit) {

            async.eachSeries(specs, function (spec, callback) {
                util.log("Unit testing " + util.colors.magenta(spec) + "...");
                karmaRunner(spec, function (err) {
                    if (err) errors.push(spec);

                    callback();
                });
            }, function(err) {
                if (err) return callback(err);

                callback();
            });
        } else {
            karmaRunner(regexp, function (err) {
                if (err) errors.push(regexp);

                callback();
            });
        }
    }, function(err) {
        if (err) return done(err);

        if (errors.length) { return done("Errors in: " + errors.join(", ")); }

        done();
    });
});

watchFilesAndReact = function () {
    var configFilePath = getConfigFilePath();

    watch([configFilePath], ["config"]);
    watch(["src/**/*.html", "!src/runner.html"], ["html"]);
    watch("src/index.html", ["index"]);
    watch(["src/assets/less/**/*.less", "!src/assets/less/vendor/**/*.less"], ["less-plumbed"]);
    watch(["src/assets/js/**/*.js", "!src/assets/js/vendor/**/*.js"], ["jshint-plumbed", "js"]);
    watch(paths.template, ["template2jst"]);
    watch("src/assets/images/**/*", ["images"]);
    watch("src/assets/locales/**/*.json", ["locales", "locales2js"]);
    watch("src/assets/js/spec/**/*.spec.js", ["runner"]);
};

gulp.task("watch", ["dontStopOnErrors", "development"], function () {
    watchFilesAndReact();
});

gulp.task("watch-without-tests", ["dontStopOnErrors", "dev-without-tests"], function () {
    watchFilesAndReact();
});

development = [
    "config",
    "jenkins-properties-file",
    "index",
    "html",
    "js",
    "template2jst",
    "json",
    "xml",
    "locales",
    "locales2js",
    "less-bootstrap",
    "less",
    "css",
    "fonts",
    "images",
    "runner"
];

gulp.task("development", function (callback) {
    runseq(
        "clean",
        "jshint",
        development,
        "unit",
        callback);
});

gulp.task("dev-without-tests", function (callback) {
    runseq("clean", "jshint", development, callback);
});

gulp.task("dontStopOnErrors", function (callback) {
    DONT_STOP_ON_ERRORS = true;
    callback();
});

function getBuildConfig () {

    var subapps = builder.getDependenciesSync("src/assets/js/app/subapps/**/*subapp.js", {
            decorate: function (path) {
                return path.substr(path.lastIndexOf("subapps")).replace(/.js$/, "");
            }
        }),
        // Performs a search and returns an array of filenames
        apps = builder.getDependenciesSync("src/assets/js/app/modules/**/*app.js", {
            decorate: function (path) {
                return path.substr(path.lastIndexOf("modules")).replace(/.js$/, "");
            }
        }),
        // Performs a search and returns an array of modules used in require calls in files found based on the pattern
        modules = builder.getModulesSync("src/assets/js/app/**/*+(app.js|subapp.controller.js)", {
            decorate: function (moduleName) {
                return {
                    name: moduleName,
                    include: [moduleName],
                    exclude: ["app"]
                };
            }
        });
    // RequireJS Optimizer Build Configuration
    // See this: https://github.com/jrburke/r.js/blob/master/build/example.build.js
    // as an example file that details all of the allowed optimizer configuration options.
    var buildConfig = {
        appDir: "build",
        optimize: "uglify2",
        optimizeCss: "standard",
        // optimize: "none",
        // optimizeCss: "none",
        findNestedDependencies: false,
        dir: "dist",
        removeCombined: true,
        inlineText: true,
        // saving a couple of KB, we use
        // libraries with MIT or Apache licenses only
        // so license comments don't need to be preserved
        preserveLicenseComments: false,
        modules: [{
            name: "app",
            include: [
                "tagger",
                "modules/layout/layout",
                "modules/layout/layout.controller",
                "modules/layout/guest/guest.controller",
                "modules/layout/main/main.controller",
                "modules/layout/simple/simple.controller",
                "modules/session/session.controller",
                "common/controller/loading.controller",
                "services/services",
                //temporary solution - forms will be moved to apache hosting
                "common/components/worms/lead/lead.structure",
                "common/components/worms/lead/templates/lead.step1.jst",
                "common/components/worms/lead/templates/lead.step2.jst",
                "common/components/worms/lead/templates/lead.error.jst",
                "common/components/worms/meeting/meeting.structure",
                "common/components/worms/meeting/templates/meeting.step1.jst",
                "common/components/worms/meeting/templates/meeting.step2.jst",
                "common/components/worms/meeting/templates/meeting.error.jst",
            ].concat(apps, subapps)
        }].concat(modules)
    };

    return buildConfig;

}

gulp.task("production", ["development"], function (callback) {

    var buildConfig = getBuildConfig();

    var requireConfig = require("./build/assets/js/require.conf.js");
    _.extend(buildConfig, requireConfig);

    requirejs.optimize(buildConfig, function () {
        del([
            "dist/runner.html",
            "dist/inprogress.html",
            "dist/assets/css/vendor",
            "dist/assets/js/app/**/templates",
            "dist/assets/js/spec",
            "dist/assets/js/spec-helpers",
            "dist/assets/js/vendor/*",
            "!dist/assets/js/app/app.js",
            "!dist/assets/js/main.js",
            "!dist/assets/js/vendor/requirejs",
            "!dist/assets/js/vendor/dtm",
            "dist/build.txt"
        ], function (err) {
            if (err) {
                return errorHandler(err);
            }
            callback();
        });
    }, errorHandler);

});

gulp.task("default", ["development"]);
