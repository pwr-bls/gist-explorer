/*global define*/
define([
    'backbone',
    'marionette',
    'underscore',
    "common/core/subapp"

], function (Backbone, Marionette, _, Subapp) {
    'use strict';

    // Our overall **AppView** is the top-level piece of UI.
    var GistExplorer = new Marionette.Application();

    GistExplorer.cfg = {
        statuses: {
            OK: "OK",
            ERRPR: "ERROR"
        },
        client_id: "087af4bba38f9f50828c", //your GitHub client_id
        githubUrl: {
            auth: "https://github.com/login/oauth/authorize"
        }
    };

    GistExplorer.addRegions({
        appRegion: "#gist-explorer-app"
    });
    GistExplorer.session = {
        startTime: "",
        endTime: "",
        token: "",
        authCode: ""
    };

    GistExplorer.ajax = function (cfg) {
        var xhr, data, settings;

        cfg = cfg || {};
        cfg.data = cfg.data || null;

        if (cfg.data) {
            try {
                data = JSON.stringify(JSON.parse(cfg.data).data);
            }
            catch (e) {
                data = "";
            }
        } else {
            data = "";
        }

        xhr = $.ajax({
            url: cfg.url,
            type: cfg.type,
            data: cfg.data,
            complete: function (jqXHR) {
                if (jqXHR.status >= 200 && jqXHR.status < 300 && jqXHR.responseJSON && jqXHR.responseJSON.status === "OK") {
                    var response, options;
                    response = jqXHR.responseType;
                    options = {
                        url: this.url,
                        data: data,
                        response: response
                    };
                }
            }
        });

        return xhr;

    };

    GistExplorer.navigate = function (route, options) {
        route = route || "";
        options = options || {};

        route = encodeURI(route.replace(/(javascript:|#).*$/, ""));

        Backbone.history.navigate(route, options);
    };

    GistExplorer.redirect = function (location) {
        window.location.replace(location);
    };

    GistExplorer.startSubApp = function (appName, callback, options) {
        var currentApp = appName ? GistExplorer.module(appName) : null;

        if (GistExplorer.currentApp === currentApp) {
            callback();
            return;
        }
        if (GistExplorer.currentApp) {
            GistExplorer.currentApp.stop();
        }
        GistExplorer.currentApp = currentApp;
        if(currentApp){
            currentApp.start();
            callback();
        }

        GistExplorer.trigger("layout:main:started:subapp", appName);
    };

    GistExplorer.getAuthCode = function (url) {
        var error = url.match(/[&\?]error=([^&]+)/),
            code = url.match(/[&\?]code=([\w\/\-]+)/);
        if (error) {
            throw 'Error getting authorization code: ' + error[1];
        }
        if (code) {
            return code[1];
        }
        return;
    };

    GistExplorer.on("before:start", function () {
        this.session.authCode = this.getAuthCode(window.location.href);
    });

    GistExplorer.on("start", function () {
        var subApps = [];

        if (Backbone.history) {
            subApps = [
                "services/services",
                "subapps/login/login.app",
                "subapps/explorer/explorer.app"
            ];

            require(subApps, function (services) {
                services(GistExplorer);


                for (var i = 0, ilen = arguments.length; i < ilen; i += 1) {
                    if (arguments[i].prototype instanceof Subapp) {
                        new arguments[i]();
                    }
                }

                Backbone.history.start();
                if (!_.isEmpty(localStorage.getItem("session.token")) && _.isEmpty(GistExplorer.session.token)) {
                    GistExplorer.session.token = localStorage.getItem("session.token");
                    localStorage.removeItem("session.token");
                }

                if (_.isEmpty(GistExplorer.session.token) && _.isEmpty(GistExplorer.session.authCode)) {
                    GistExplorer.navigate("login");
                    GistExplorer.trigger("login:show");

                    return;
                }
                if (!_.isEmpty(GistExplorer.session.authCode)) {
                    GistExplorer.navigate("authenticate");

                    GistExplorer.request("service:authenticate:request", {
                        code: GistExplorer.session.authCode
                    })
                        .done(function (response, status) {
                            GistExplorer.session.token = response.data;
                            localStorage.setItem("session.token", response.data);
                            Backbone.history.location.href = Backbone.history.location.origin;

                        })
                        .fail(function () {
                            console.log("fail", arguments);
                        })
                        .always(function () {
                        });
                    return;
                }
                if (!_.isEmpty(GistExplorer.session.token)){
                    GistExplorer.navigate("explorer");
                    GistExplorer.trigger("explorer:show");
                }
            });
        }
    });

    return GistExplorer;
});