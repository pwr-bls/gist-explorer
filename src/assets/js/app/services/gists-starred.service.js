define([
    "services/service.factory"
], function (serviceFactory) {
    "use strict";
    return function(App){
        return serviceFactory(App, {
            name: "gists:starred",
            url: "/rest/gists/starred",
            type: "POST",
            cache: false
        });
    };
});