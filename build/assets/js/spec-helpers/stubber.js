// require.js provides the ability to unload a module using require.undef
// and to define a module with an explicit name. We can combine these functions
// to override any module with a custom implementation temporarily.
//
// Source: https://www.symphonious.net/2013/07/08/injecting-stubsmocks-into-tests-with-require-js/
//         https://gist.github.com/Integralist/8400550
define(["require", "underscore"], function (require, _) {
    "use strict";

    var stubbed = [];

    return {
        stub: function (name, implementation) {
            if (!implementation) {
                // If there is no implementation we assume the name (the first and the only one param)
                // is the object with hashmap of stubs.
                _.each(name, function(value, key) {
                    this.stub(key, value);
                }, this);
            } else {
                // For each stub, we first undef any real module that may have been loaded,
                // then use the named version of define to inject our stub into require.js’
                // cache of loaded modules.
                stubbed.push(name);
                requirejs.undef(name);
                define(name, [], function () {
                    return implementation;
                });
            }
        },

        stubquire: function (name, callback) {
            // Once all the required stubs are loaded, we force the module we want to test to be reloaded,
            // otherwise require.js may have a cached version of it with its real dependencies already injected.
            stubbed.push(name);
            requirejs.undef(name);
            require([name], callback);
        },

        reset: function (callback) {
            // Once we’ve run our tests we simply undef and reqiore again any modules we’ve stubbed
            // or that have been reloaded to use those stubs.
            var cleaner = function (tab) {
                var name;

                if (tab.length) {
                    name = tab.shift();

                    requirejs.undef(name);

                    require([name], function () {
                        cleaner(tab);
                    });
                } else if (typeof callback === "function") {
                    callback();
                }
            };

            cleaner(stubbed);
        }
    };
});
