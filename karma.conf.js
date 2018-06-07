module.exports = function (config) {
    "use strict";

    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "build",

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["jasmine", "requirejs"],

        // list of files / patterns to load in the browser
        files: [
            // this files should be served by the webserver but not included on
            // the page with <script> tags
            {pattern: "assets/js/vendor/**/*.js", included: false},

            //{pattern: "assets/js/**/*.js", included: false},
            {pattern: "assets/js/app/**/*.js", included: false},
            {pattern: "assets/js/app/**/*.html", included: false},

            // tests files
            {pattern: "assets/js/spec-helpers/**/*.js", included: false},
            {pattern: "assets/js/spec/**/*.spec.js", included: false},


            {pattern: "assets/js/require.conf.js", included: false},

            {
                pattern: "assets/images/*",
                included: false
            },
            // this files will be included in the karma bootstrap html file with a <script> tag
            "assets/js/spec/karma.main.js"
        ],

        // list of files to exclude
        exclude: [
            "assets/js/main.js",
            "assets/js/spec/modules/dynamo/**/*.spec.js"
        ],

        plugins: [
            "karma-jasmine",
            "karma-nyan-reporter",
            "karma-mocha-reporter",
            "karma-htmlfile-reporter",
            "karma-phantomjs-launcher",
            "karma-chrome-launcher",
			"karma-ie-launcher",
			"karma-firefox-launcher",
            "karma-requirejs",
            "karma-coverage"
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            "assets/js/app/**/*[!.jst].js": ["coverage"]
            // do not include precompiled templates

        },

        // test results reporter to use
        // possible values: "dots", "progress"
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["progress", "html", "coverage"],
        // reporters: ["mocha", "html", "coverage"],

        // optionally, configure the reporter
        coverageReporter: {
            type: "html",
            dir: "../reports/unit/coverage",
            subdir: ".",
            file: "index.html"
        },

        htmlReporter: {
            outputFile: "../reports/unit/units.html"
        },

        // web server port
        port: 9876,

        proxies: {
            "/assets/locales/": "http://localhost:9876/base/assets/locales/",
            "/assets/json/": "http://localhost:9876/base/assets/json/",
            "/assets/images/": "http://localhost:9876/base/assets/images/"
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            "PhantomJS"
            // , "Chrome"
            // , "Firefox"
            // , "Safari"
        ],

        // Timeout for capturing a browser (in ms).
        captureTimeout: 30000,

        // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
        browserNoActivityTimeout: 30000,

        // show tests which are slower than 1 second
        reportSlowerThan: 1000,

        // Mocha reporter configuration tunning
        mochaReporter: {
            output: "autowatch"
        },

        client: {
            // https://github.com/karma-runner/karma-requirejs/issues/6
            //requireJsShowNoTimestampsError: false,

            // Capture all console output and pipe it to the terminal
            captureConsole: true,

            // Custom spec regex matcher
            specRegexp: ".spec.js$"
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
