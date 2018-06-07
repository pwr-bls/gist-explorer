/*globals define*/
define([
    "underscore",
    "jquery"
], function (_, $) {
    "use strict";

    var defaults,
        serviceFactory;

    // Service default options
    defaults = {

        // Service name. Name will be used to create
        // names of events handled by service.
        name: "default",

        // URL of an API endpoint which will be used to request data.
        url: "/rest/undefined",

        // Ajax request type
        type: "POST",

        // Method (optional) for parsing response data before
        // returning it back to the requesting object.
        parseResponse: null,

        // Should this service cache responses.
        cache: false
    };

    // Helper factory for creating a basic service.
    //
    // In a basic form a service listens to a global request and returns
    // a promise which will be resolved (or rejected) with data received
    // from associated API endpoint.
    //
    // Service is listening for a request named: service:[[ options.name ]]:request
    //
    // It creates and returns a promise. Service will keep track of this promise
    // until it is resolved or rejected, after that it is either stored in local
    // cache or deleted if cache is disabled..
    // When another request is registered when the promise exists
    // (data was not yet returned from API endpoint or is stored in cach)
    // it will recieve an existing promise.
    // When a request comes and there is no existing response promise in the service,
    // a new one is created.
    // This mechanism ensures that only one request to an API endpoint (with certain data)
    // is active at the same time, and that all requesting objects will receive
    // data or information about failure.
    //
    // A request is registered by its data (which is hashed). Two requests to
    // the service with different data will create two separate promises.
    //
    // Service tries to get requested data from local cached data
    // (if cache is enabled) or from API endpoint.
    //
    // When data is ready, it passes it through options.parseResponse() method
    // (if it is defined) and resolves a promise.
    //
    // If an error occures the promise is rejected.
    //
    // In addition to returning a promise the service triggers two global events:
    //
    // service:[[ options.name ]]:request:success - when data is rtrieved successfully,
    // either from cache or from API endpoint
    //
    // service:[[ options.name ]]:request:error - when an error occurs
    //
    // Service also listens to a request named: service:[[ options.name ]]:reset,
    // which stops all pending requests (rejects all existing promises)
    // and cleares cached data.
    //
    // For testing and debuging service can respond to service:[[ options.name ]]:debug request
    // and return an object containing local cached data.
    //
    // Service factory returns an object which exposes start() and stop().
    // start() - registeres service request handlers
    // stop() - resets service data and deregisters request handlers

    serviceFactory = function (App, opts) {
        var options = _.defaults(opts, defaults),

        // Cache storing request deferreds.
            cache = {},

        // Helper methods.
            helpers = {};

        // Creates a hash key for given data.
        helpers.hashData = function (data) {
            return JSON.stringify(data || "");
        };

        helpers.resetService = function () {
            var key,
                deferred;

            for (key in cache) {
                if (cache.hasOwnProperty(key)) {
                    deferred = cache[key];
                    delete cache[key];
                    deferred.reject({});
                }
            }

            App.trigger("service:" + options.name + ":reset:success");
        };

        helpers.getServiceDebugData = function () {
            var cachedData = {},
                deferred,
                key,
            // Helper method used to handle resolved promises.
            // If it was defined in a loop, where it is used,
            // jsHint would raise an error (methods should not be defined in loops).
            // In this case it is needed to extract data from promises.
                doneHandler = function (key) {
                    return function (response) {
                        cachedData[key] = response;
                    };
                };

            for (key in cache) {
                if (cache.hasOwnProperty(key)) {
                    deferred = cache[key];

                    if (deferred.state() !== "resolved") {
                        cachedData[key] = "Pending";
                    } else {
                        // If deferred is resolved this is executed imidietly.
                        deferred.done(doneHandler(key));
                    }
                }
            }

            return cachedData;
        };

        // Method which registers request handlers.
        helpers.registerHandlers = function () {

            // Set global handlers for service request.
            App.reqres.setHandler("service:" + options.name + ":request", function (data, getData) {
                var requestDeferred,
                    dataHash = helpers.hashData(data),
                    onSuccess,
                    onError;

                // Ajax request error handler.
                onError = function (jqXHR, textStatus, errorThrown) {
                    // Delete stored promise before returning data!
                    // If (for example) data is requested again on failuer,
                    // and this promise exists, the caller may receive the same, rejected promise.
                    delete cache[dataHash];

                    // keep the query for further use
                    if (jqXHR) {
                        jqXHR.query = data;
                    }

                    jqXHR.responseJSON = jqXHR.responseJSON || {};

                    App.trigger("service:" + options.name + ":request:error", jqXHR, textStatus, errorThrown);
                    requestDeferred.reject(jqXHR, textStatus, errorThrown);
                };

                // Ajax request success handler.
                onSuccess = function (res, textStatus, jqXHR) {
                    // keep the query for further use
                    if (jqXHR) {
                        jqXHR.query = data;
                    }

                    if (res.status === App.cfg.statuses.OK) {

                        if (_.isFunction(options.parseResponse)) {
                            res = options.parseResponse(res);
                        }

                        // Don't cache data if global cache handler is not working.
                        // This may lead to invalid app data being displayed, as
                        // cached data would not be cleared by specified operations.
                        if (!options.cache || !App.reqres.request("cache-control:enabled")) {
                            delete cache[dataHash];
                        }

                        App.trigger("service:" + options.name + ":request:success", res, textStatus, jqXHR);
                        requestDeferred.resolve(res, textStatus, jqXHR);
                    } else {
                        // http://api.jquery.com/jquery.ajax/
                        // following the documentation
                        onError(jqXHR, textStatus, "Server Error");
                    }
                };

                if (cache[dataHash]) {
                    requestDeferred = cache[dataHash];

                    // When data retrieved from cache, request:success event still needs to be triggered
                    requestDeferred.done(function () {
                        var args = Array.prototype.slice.call(arguments);

                        // Defer triggering request:success event so it simulates native request behavior
                        // and executes after current operation flow finishes.
                        _.defer(function () {
                            App.trigger.apply(App, ["service:" + options.name + ":request:success"].concat(args));
                        });
                    });
                } else {
                    cache[dataHash] = requestDeferred = $.Deferred();
                    App.ajax({
                        type: options.type,
                        url: options.url,
                        data: {
                            data: data
                        }
                    }).done(onSuccess).fail(onError);
                }

                return requestDeferred.promise();
            });

            App.reqres.setHandler("service:" + options.name + ":reset", helpers.resetService);
            App.reqres.setHandler("service:" + options.name + ":debug", helpers.getServiceDebugData);
        };

        // Method which removes request handlers.
        helpers.deregisterHandlers = function () {

            App.reqres.removeHandler("service:" + options.name + ":request");
            App.reqres.removeHandler("service:" + options.name + ":reset");
            App.reqres.removeHandler("service:" + options.name + ":debug");
        };

        return {
            start: function () {
                helpers.registerHandlers();

                // Every service which stores data internally
                // should reset on session end.
                App.on("session:end", helpers.resetService);

                return this;
            },

            stop: function () {
                helpers.resetService();
                helpers.deregisterHandlers();

                App.off("session:end", helpers.resetService);

                return this;
            },

            cfg: function () {
                return options;
            }
        };

    };

    return serviceFactory;
});
