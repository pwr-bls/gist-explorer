define([
        "marionette"
    ], function (Marionette) {
        "use strict";

        return Marionette.AppRouter.extend({
            appRoutes: {
                "explorer": "showExplorer",
                "explorer/:action": "showExplorer"
            }
        });
    }
);