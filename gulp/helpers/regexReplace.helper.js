"use strict";

var stream = require("stream");

module.exports = function () {
    var transformer = new stream.Transform({objectMode: true});
    transformer._transform = function (file, unused, done) {
        var fileContent = file.contents.toString("utf-8"),
            pattern = new RegExp("(?:<[^>]*class\\s*=\\s*[^>]*[ \\\"\\\'])(ing-demo)(?:[ \\\"\\\'][^>]*)"),
            match = pattern.exec(fileContent),
            deleted, replaced;
        if (!!fileContent.match(pattern)) {
            while (!!match) {
                deleted = match[0].replace("ing-demo", "");
                replaced = fileContent.replace(match[0], deleted);
                fileContent = replaced;
                match = pattern.exec(fileContent);
            }
            file.contents = new Buffer(fileContent);
        }
        done(null, file);
    };
    return transformer;
};