define([
    "app",
    "marionette",
    "subapps/explorer/controllers/explorer.controller.js"
], function (GistExplorer, Marionette, ExplorerController) {
    "use strict";
    return Marionette.Controller.extend({
        showExplorer: function () {
            GistExplorer.startSubApp("Explorer", function () {
                new ExplorerController({region: GistExplorer.appRegion}).start();
            });
        }
    });
});