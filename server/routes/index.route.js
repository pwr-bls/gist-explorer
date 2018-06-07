var controller = require(process.cwd() + "/server/controllers/index.controller.js"),
    express = require("express"),
    router = express.Router();


router.route("/")
    .post(controller.index);

module.exports = router;
