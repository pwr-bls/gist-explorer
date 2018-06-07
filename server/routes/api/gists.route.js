var controller = require(process.cwd() + "/server/controllers/api/gists.controller.js"),
    express = require("express"),
    router = express.Router();


router.route("/gists/all")
    .post(controller.getGists);
router.route("/gists/public")
    .post(controller.getGistsPublic);
router.route("/gists/starred")
    .post(controller.getGistsStarred);

module.exports = router;
