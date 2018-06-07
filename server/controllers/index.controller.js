module.exports = {
    index: function (req, res) {
        "use strict";

        return res.sendFile(process.cwd() + "/app/index.html");
    }
};