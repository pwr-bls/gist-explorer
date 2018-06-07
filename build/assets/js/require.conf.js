(function (root, factory) {
    "use strict";
    if(typeof exports === "object"){
        module.exports = factory();
    }
    else if(typeof define === "function" && define.amd){
        define([], factory);
    }
})(this, function () {
    "use strict";
    var reguireConfig = {
        baseUrl: "assets/js/",
        paths: {
            jquery: "vendor/jquery/2.1.4/jquery",
            underscore: "vendor/underscore/1.8.3/underscore-min",
            backbone: "vendor/backbone/1.2.3/backbone",
            marionette: "vendor/backbone.marionette/2.4.3/backbone.marionette",
            backboneLocalstorage: "vendor/backbone.localstorage/1.1.16/backbone.localStorage",
            tpl: 'vendor/requirejs-tpl/tpl',
            text: 'vendor/requirejs-text/text',
            bootstrap: "vendor/bootstrap/3.3.5/bootstrap",


            app: "app/app",
            common: "app/common",
            services: "app/services",
            subapps: "app/subapps"
        },
        shim: {
            jquery: {
                exports: "jQuery"
            },
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: [
                    'underscore',
                    'jquery'
                ],
                exports: 'Backbone'
            },
            marionette: {
                deps: ["backbone"],
                exports: "Marionette"
            },
            backboneLocalstorage: {
                deps: ['backbone'],
                exports: 'Store'
            },
            bootstrap: {
                deps: ["jquery"],
                exports: "Bootstrap"
            }
        }
    };

    return reguireConfig;
});

