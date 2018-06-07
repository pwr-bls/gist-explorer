var controller = require(process.cwd() + "/server/controllers/api/user.controller.js"),
    express = require("express"),
    router = express.Router();


router.route("/user")
    .post(controller.user);

module.exports = router;
