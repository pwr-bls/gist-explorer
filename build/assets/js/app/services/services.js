define([
    "underscore",
    "services/auth.service",
    "services/gists.service",
    "services/gists-public.service",
    "services/gists-starred.service",
    "services/user.service"

], function (_) {
    "use strict";

    // Method arguments correspond to service paths
    // get all services, without underscore
    var services = Array.prototype.slice.call(arguments, 1);

    return function (App) {
        _.each(services, function (constructor) {
            var service = constructor(App);
            // some of the included services don't have a start method
            if (typeof service.start === "function") {
                service.start();
            }
        });

    };

});
