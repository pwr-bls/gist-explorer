var controller = require(process.cwd() + "/server/controllers/api/authenticate.controller.js"),
    express = require("express"),
    router = express.Router();


router.route("/authenticate")
    .post(controller.authenticate);

module.exports = router;
