define([
    "services/service.factory"
], function (serviceFactory) {
    "use strict";
    return function(App){
        return serviceFactory(App, {
            name: "gists:public",
            url: "/rest/gists/public",
            type: "POST",
            cache: false
        });
    };
});