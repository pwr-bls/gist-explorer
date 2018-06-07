"use strict";

var fs = require("fs"),
    _ = require("underscore"),
    glob = require("glob"),
    esprima = require("esprima");

// module.exports.getDependencies = function (pattern, callback) {
// 
// };

// Performs a search and returns an array of filenames
module.exports.getDependenciesSync = function (pattern, options) {
    var paths = glob.sync(pattern);

    if (options && options.decorate) {
        paths = this.decorate(paths, options);
    }

    return paths;
};

// module.exports.getModules = function (pattern, callback) {
// 
// };


// Performs a search and returns an array of modules used in require calls in files found based on the pattern
module.exports.getModulesSync = function (pattern, options) {
    var paths = glob.sync(pattern),
        contents;

    // get content of all files
    contents = _.map(paths, function (path) {
        return fs.readFileSync(path, "utf8");
    });

    var ret = [];

    _.each(contents, function (content) {

        // get tokens for given file
        var tokens = esprima.tokenize(content),
            needle = null,
            collector = [];

        _.each(tokens, function (token, index) {
            // find require calls and collect the module names
            if (token.type === "Identifier" && token.value === "require") {
                needle = index;
            }

            if (needle) {
                // ignore require calls different than require(["module/path"])
                if (collector.length === 2 && token.value !== "[") {
                    needle = null;
                    collector = [];
                    return null;
                }

                collector.push(token);
            }

            if (token.type === "Punctuator" && token.value === "]") {
                _.each(collector, function (token) {
                    if (token.type === "String") {
                        ret.push(token.value.replace(/['"]+/g, ""));
                    }
                });
                needle = null;
                collector = [];
            }

        });

    });

    ret = _.uniq(ret);

    if (options && options.decorate) {
        ret = this.decorate(ret, options);
    }

    return ret;

};

module.exports.decorate = function (paths, options) {

    return _.map(paths, function (path) {

        if (typeof options.decorate === "function") {
            return options.decorate(path);
        }

        return path;
    });

};