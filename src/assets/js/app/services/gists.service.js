define([
    "services/service.factory"
], function (serviceFactory) {
    "use strict";
    return function(App){
        return serviceFactory(App, {
            name: "gists",
            url: "/rest/gists/all",
            type: "POST",
            cache: false
        });
    };
});