define([
    "app",
    "marionette",
    "subapps/login/views/login.view"
], function (GistExplorer, Marionette, LoginView) {
    "use strict";
    return Marionette.Controller.extend({

        /**
         * create LoginView
         * @returns {LoginView}
         */
        createLoginView: function () {
            var layout = new LoginView(),
                scope = [
                "user",
                "public_repo",
                "repo",
                "gist",
                "notifications"
            ];

            /**
             * add listener on clict at login button
             */
            this.listenTo(layout, "login:click", function () {
                GistExplorer.redirect(GistExplorer.cfg.githubUrl.auth + "/?client_id=" + GistExplorer.cfg.client_id + "&scope=" + scope.join(","));
            });

            return layout;
        },

        /**
         * show loginView in appRegion
         */
        show: function () {
            GistExplorer.appRegion.show(this.createLoginView());
        },

        /**
         * Method start controller and show loginView
         */
        start: function () {
            this.show();
        }


    });
});