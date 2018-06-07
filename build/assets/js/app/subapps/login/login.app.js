define([
    "app",
    "common/core/subapp",
    "subapps/login/controllers/subapp.controller",
    "subapps/login/routers/subapp.router"
], function (GistExplorer, Subapp, SubappController, SubappRouter) {
    "use strict";

    return Subapp.extend({
        initialize: function () {
            this.controller = new SubappController();
            this.router = new SubappRouter({
                controller: this.controller
            });

            this.listenTo(GistExplorer, "login:show", function (options){
                GistExplorer.navigate("login", options);
                this.controller.showLogin();
            });
        }
    });
});