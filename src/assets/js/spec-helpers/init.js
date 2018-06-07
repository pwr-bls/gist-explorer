/* global beforeAll */

// Custom matchers and helpers were moved to separate require.js modules
// for clarity and to prevent polluting global scope.
// We now require them before use.
//
// Requiering them in beforeEach() took too long so we require them once in
// beforeAll().
//
// Registering custom matchers is not allowed in beforeAll(), see below:
// https://github.com/jasmine/jasmine/issues/821
// We use beforeAll() to load matchers and helpers with require()
// and then register a beforeEach() method which adds them to jasmine.

beforeAll(function(done) {
    "use strict";

    require([
        "spec-helpers/custom-matchers",
        "spec-helpers/custom-helpers"
        ], function (customMatchers, customHelpers) {

        beforeEach(function () {
            jasmine.addMatchers(customMatchers);
            jasmine.customHelpers = customHelpers;
        });

        done();
    });
});


