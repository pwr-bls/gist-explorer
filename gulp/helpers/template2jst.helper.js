"use strict";

var _ = require("underscore"),
    stream = require("stream"),
    util = require("gulp-util");

module.exports = function () {
    var transformer = new stream.Transform({objectMode: true});
    transformer._transform = function (file, unused, done) {
        var singleTemplate = file.contents.toString("utf8");
        var compiled = "define(function () { return " + _.template(singleTemplate).source + " });";
        file.contents = new Buffer(compiled);
        file.path = util.replaceExtension(file.path, ".jst.js");
        done(null, file);
    };
    return transformer;
};