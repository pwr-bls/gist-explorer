define([
    "app",
    "common/core/subapp",
    "subapps/explorer/controllers/subapp.controller",
    "subapps/explorer/routers/subapp.router"
], function (GistExplorer, Subapp, SubappController, SubappRouter) {
    "use strict";

    return Subapp.extend({
        initialize: function () {
            this.controller = new SubappController();
            this.router = new SubappRouter({
                controller: this.controller
            });

            this.listenTo(GistExplorer, "explorer:show", function (options){
                GistExplorer.navigate("explorer", options);
                this.controller.showExplorer();
            });
        }
    });
});