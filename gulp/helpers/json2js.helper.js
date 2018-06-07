"use strict";

var stream = require("stream"),
    util = require("gulp-util");

module.exports = function () {
    var transformer = new stream.Transform({objectMode: true});
    transformer._transform = function (file, unused, done) {
        var json = file.contents.toString("utf-8");
        var compiled = "define(function () { return " + json + "; });";
        file.contents = new Buffer(compiled);
        file.path = util.replaceExtension(file.path, ".js");
        done(null, file);
    };
    return transformer;
};