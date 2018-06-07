define([
    "services/service.factory"
], function (serviceFactory) {
    "use strict";
    return function(App){
        return serviceFactory(App, {
            name: "authenticate",
            url: "/rest/authenticate",
            cache: false
        });
    };
});