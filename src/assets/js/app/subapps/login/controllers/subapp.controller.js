define([
    "app",
    "marionette",
    "subapps/login/controllers/login.controller.js"
], function (GistExplorer, Marionette, LoginController) {
    "use strict";
    return Marionette.Controller.extend({
        showLogin: function () {
            GistExplorer.startSubApp("Login", function () {
                new LoginController({region: GistExplorer.appRegion}).start();
            });
        }
    });
});