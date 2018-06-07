define(function () {
    "use strict";

    return {
        getListenerCallback: function (listenerName, calls, posName, posEvent) {
            var call, foundCall, i, j;
            posName = typeof posName === "number" ? posName : 1;
            posEvent = typeof posEvent === "number" ? posEvent : 2;
            for (i = 0, j = calls.length; i < j; i++) {
                call = calls[i];
                if (call.args[posName] === listenerName) {
                    foundCall = call.args[posEvent];
                    break;
                }

            }
            return foundCall;
        },

        // Helper methods returning resolved/rejected promises.
        getResolvedPromise: function (data) {
            return $.Deferred().resolve(data).promise();
        },

        getRejectedPromise : function (data) {
            return $.Deferred().reject(data).promise();
        },

        // Helper method which wraps a spy arround
        // App.reqres.request.
        // It handles requests described in params and
        // passes control to native handler for all unspecifide requests.
        //
        // opts = {
        //     request name : return data,
        //     request name : return data
        // }
        //
        // Returned data can be a single object, an array or a function.
        // If it is an object, it will be returned for all requests.
        // If an array is passed then subsequent responses will get values corresponding to certain array positions.
        // If it is a function it will be called with proviced parameters and its value will be returned.
        // All others (after array.length) will receive undefined.
        spyOnServiceRequests: function (App, opts) {
            var self = this,
                baseRequest = App.reqres.request;

            // handle multiple responses to the same request
            _.each(opts, function (value, key) {
                if (_.isArray(value)) {
                    opts[key] = self.getResponseSequence(value);
                }
            });

            // mock only selected requests
            spyOn(App.reqres, "request").and.callFake(function (name) {

                if (opts[name]) {
                    if (_.isFunction(opts[name])) {
                        // if associated value is a function
                        // it could be a function created by getResponseSequence()
                        // or a handler function passed in tests,
                        // either way forward additional arguments
                        return opts[name].apply(null, Array.prototype.slice.call(arguments, 1));
                    }
                    return opts[name];
                }

                return baseRequest.apply(App.reqres, arguments);
            });
        },

        // Helper method used in combination with spyOnServiceRequests().
        // It creates a kind of generator based on passed array.
        // Subsequent calls will receive values corresponding to array indexes.
        // All others (after array.length) will receive defaultResponse.
        getResponseSequence : function (responseArray, defaultResponse) {
            var calls = 0, response;

            return function () {
                if (responseArray.length > calls) {
                    response = responseArray[calls++];
                } else {
                    response = defaultResponse;
                }

                // handler functions could have been passed as
                // sequence handlers
                if (_.isFunction(response)) {
                    return response.apply(null, arguments);
                }
                return response;
            };
        },

        mockMediaq : function(mediaq, type){
            spyOn(mediaq, "getEvents").and.callFake(function () {
                return {
                    enter: type
                };
            });
        }

    };
});


