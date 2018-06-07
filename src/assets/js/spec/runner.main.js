(function() {
    "use strict";

    require(["../require.conf"], function (requireConfig) {

        var requireTestConfig = {
            baseUrl: "assets/js",

            paths: {
                "jasmine": "vendor/jasmine/2.3.0/jasmine",
                "jasmine-html": "vendor/jasmine/2.3.0/jasmine-html",
                "jasmine-boot": "vendor/jasmine/2.3.0/boot",
                "jasmine-jquery" : "vendor/jasmine-jquery/2.0.5/jasmine-jquery",
                "jasmine-ajax" : "vendor/jasmine-ajax/2.0.0/jasmine-ajax",
                "spec-stubber": "spec-helpers/stubber",
                // loads custom matchers and helpers
                "spec-init": "spec-helpers/init"
            },

            shim: {
                "jasmine": {
                    exports: "window.jasmineRequire"
                },
                "jasmine-html": {
                    deps: ["jasmine"],
                    exports: "window.jasmineRequire"
                },
                "jasmine-boot": {
                    deps: ["jasmine", "jasmine-html"],
                    exports: "window.jasmineRequire"
                },
                "jasmine-jquery": ["jquery", "jasmine-boot"],
                "jasmine-ajax": ["jasmine-boot"],
                "spec-init": ["jasmine-boot"]
            },

            waitSeconds: 60
        };

        // Set application configuration
        requirejs.config(requireConfig);

        // Set test configuration
        requirejs.config(requireTestConfig);

        // Load Jasmine - This will still create all of the normal Jasmine browser globals unless `boot.js` is re-written to use the
        // AMD or UMD specs. `boot.js` will do a bunch of configuration and attach it's initializers to `window.onload()`. Because
        // we are using RequireJS `window.onload()` has already been triggered so we have to manually call it again. This will
        // initialize the HTML Reporter and execute the environment.
        require(["jasmine-boot", "jasmine-ajax", "jasmine-jquery", "spec-init"], function () {
            // Load the specs (specs array is prepared in runner.html)
            require(specs, function () {
                //default for jasmine is 40, but with so many depths in hangs on function toHaveBeenCalledWith()
                //when we compare App as param for example
                //jasmine.MAX_PRETTY_PRINT_DEPTH = 40;

                // Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
                window.onload();
            });
        });
    });
})();
