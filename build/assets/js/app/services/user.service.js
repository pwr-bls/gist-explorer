define([
    "services/service.factory"
], function (serviceFactory) {
    "use strict";
    return function(App){
        return serviceFactory(App, {
            name: "user",
            url: "/rest/user",
            type: "POST",
            cache: false
        });
    };
});