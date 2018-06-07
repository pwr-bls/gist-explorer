(function() {
    "use strict";

    require(["base/assets/js/require.conf"], function (requireConfig) {
        var specs = [];
        var SPEC_REGEXP = new RegExp(window.__karma__.config.specRegexp || ".spec.js$");

        var pathToModule = function(path) {
            return path.replace(/^\/base\/assets\/js\//, "").replace(/\.js$/, "");
        };

        Object.keys(window.__karma__.files).forEach(function(file) {
            if (SPEC_REGEXP.test(file)) {
                // Normalize paths to RequireJS module names.
                specs.push(pathToModule(file));
            }
        });

        var requireTestConfig = {
            baseUrl: "/base/assets/js",

            paths: {
                "jasmine-jquery" : "vendor/jasmine-jquery/2.0.5/jasmine-jquery",
                "jasmine-ajax" : "vendor/jasmine-ajax/2.0.0/jasmine-ajax",
                "spec-stubber": "spec-helpers/stubber",
                "spec-init": "spec-helpers/init"
            },

            shim: {
                "jasmine-jquery": ["jquery"]
            },

            // dynamically load all test files
            deps: specs,

            // we have to kickoff jasmine, as it is asynchronous
            //callback: window.__karma__.start
            //

            // start test run, once Require.js is done
            // the original callback here was just:
            // callback: window.__karma__.start
            // I was running into issues with jasmine-jquery though
            // specifically specifying where my fixtures were located
            // this solved it for me.
            callback: function() {
                require(["jasmine-ajax", "jasmine-jquery", "spec-init"], function() {
                    //jasmine.getFixtures().fixturesPath = "test/fixtures";

                    //default for jasmine is 40, but with so many depths in hangs on function toHaveBeenCalledWith()
                    //when we compare App as param for example
                    //jasmine.MAX_PRETTY_PRINT_DEPTH = 40;

                    window.__karma__.start();
                });
            },

            waitSeconds: 60
        };

        // Set application configuration
        requirejs.config(requireConfig);

        // Set test configuration
        requirejs.config(requireTestConfig);

    });
})();
