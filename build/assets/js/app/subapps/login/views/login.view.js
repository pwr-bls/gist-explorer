define([
    "marionette",
    "subapps/login/templates/login.view.jst"
], function (Marionette, loginJst) {
    "use strict";
    return Marionette.LayoutView.extend({
        template: loginJst,
        className: "col-xs-offset-4 col-xs-4",

        ui: {
            loginBtn: ".js-login-btn"
        },

        events: {
            "click @ui.loginBtn": "clickLogin"
        },

        clickLogin: function () {
            this.trigger("login:click");
        }
    });
});