define([
    "app",
    "backbone",
    "marionette",
    "subapps/explorer/views/explorer.view.js"
], function (GistExplorer, Backbone, Marionette, ExplorerView) {
    "use strict";
    return Marionette.Controller.extend({
        /**
         * Method prepare params for controller before start
         */
        initialize: function () {
            this.models = {};
        },

        /**
         * Method create and return ExplorerView
         * @returns {ExplorerView}
         */
        createExplorerView: function () {
            var layout = new ExplorerView({
                model: this.models.user
            });

            return layout;
        },

        /**
         * Metod show explorerView on appRegion
         */
        show: function () {
            GistExplorer.appRegion.show(this.createExplorerView());
        },

        /**
         * Method run service to get UserInfo
         * @returns {*}
         */
        getUserInfo: function () {
            var user = GistExplorer.request("service:user:request", {
                auth_token: GistExplorer.session.token
            });

            user.done(_.bind(function (response, status, scope) {
                console.log("Logged User Data:", response.data);
                this.models.user = new Backbone.Model(response.data);
            }, this))
                .fail(function () {
                })
                .always(function () {
                });

            return user;
        },

        /**
         * Method run service to get User Gists Info
         * @returns {*}
         */
        getGistsInfo: function () {
            var gists = GistExplorer.request("service:gists:request", {
                auth_token: GistExplorer.session.token
            });

            gists.done(function (response, status, scope) {
                console.log("Logged User Gists:", response.data);
            })
                .fail(function () {
                })
                .always(function () {
                });

            return gists;
        },

        /**
         * Method start controller
         * After call getUserInfo wait to resolve promise then show explorerView
         */
        start: function () {
            $.when(this.getUserInfo(), this.getGistsInfo()).done(_.bind(function () {
                this.show();
            }, this));
        }


    });
});