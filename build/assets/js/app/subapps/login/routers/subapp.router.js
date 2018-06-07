define([
        "marionette"
    ], function (Marionette) {
        "use strict";

        return Marionette.AppRouter.extend({
            appRoutes: {
                "login": "showLogin",
                "login/:action": "showLogin"
            }
        });
    }
);