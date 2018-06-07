(function () {
    'use strict';

    require(['assets/js/startup'], function (Startup) {
        Startup.initializeRequireJS();
        require(["app"], function (App) {
            App.start();
        });
    });
})();
