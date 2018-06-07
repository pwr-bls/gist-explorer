define(["underscore"], function (_) {
    "use strict";

    return {
        toHaveBeenCalledWithExampleCustomMatcher: function (util, customEqualityTesters) {
            return {
                compare: function (actual) {
                    var result = false;
                    return {
                        pass: result
                    };
                }
            };
        },
        // custom matcher for tagger, checks if last tag is equal to given value
        lastLoggedCodeToBe: function (util, customEqualityTesters) {
            return {
                compare: function (tagger, expectedLongKey) {
                    var lastTaggedElement, expectedShortKey, tags, result = {pass: false};

                    if (!tagger.get || typeof tagger.get !== "function") {
                        result.message = "Argument " + tagger + " it not valid object, pass the tagger to expect function";
                    } else {
                        tags = tagger.get();
                        if (!tags.length) {
                            result.message = "Expected " + expectedLongKey + " to be logged but tagger's log is empty";
                        } else {
                            lastTaggedElement = tags[tags.length - 1];
                            expectedShortKey = tagger.getValue(expectedLongKey);
                            if (!expectedShortKey) {
                                result.message = expectedLongKey + " is not valid tagger key";
                            } else if (lastTaggedElement.name !== expectedShortKey) {
                                result.message = "Last tagged element is " + lastTaggedElement.name + ", expected: " + expectedShortKey + " (" + expectedLongKey + ")";
                            } else {
                                result.pass = true;
                            }
                        }
                    }
                    return result;
                }
            };
        },
        // custom matcher for tagger, checks if last tag value is equal to given value
        lastLoggedValueToBe: function (util, customEqualityTesters) {
            return {
                compare: function (tagger, expectedLastValue) {
                    var lastTaggedValue, tags, result = {pass: false};

                    if (!tagger.get || typeof tagger.get !== "function") {
                        result.message = "Argument " + tagger + " it not valid object, pass the tagger to expect function";
                    } else {
                        tags = tagger.get();
                        if (!tags.length) {
                            result.message = "Expected " + expectedLastValue + " to be logged but tagger's log is empty";
                        } else {
                            lastTaggedValue = tags[tags.length - 1].value;
                            if (lastTaggedValue !== expectedLastValue) {
                                result.message = expectedLastValue + " is not equal to " + lastTaggedValue;
                            } else {
                                result.pass = true;
                            }
                        }
                    }
                    return result;
                }
            };
        },
        // For testing Tagger data
        // =======================
        // this is used for checking if correct tags (checking without timestamp)
        // were provided in the next request sended to api
        toHaveTagsInParamsRequest: function (util, customEqualityTesters) {
            return {
                compare : function (params, expected) {

                    var result = {},
                        trace,
                        traceArr,
                        i,
                        tmp,
                        actual = [];

                    result.pass = false;

                    try {
                        trace = JSON.parse(params).trace;
                    } catch (e) {
                        trace = "";
                    }

                    traceArr = trace.split(";");

                    if (traceArr) {

                        for (i = 0; i < traceArr.length; i++) {
                            tmp = traceArr[i].split(",");

                            if (tmp.length === 3 && tmp[2] !== "") {
                                actual.push(tmp[0] + "," + tmp[2]);
                            } else {
                                actual.push(tmp[0]);
                            }
                        }
                        actual = actual.join(";");
                        result.message = "Expect tags: '" + actual + "' to equal: '" + expected + "'";
                        if (actual === expected) {
                            result.pass = true;
                            result.message = "";
                        }
                    }
                    return result;
                }
            };
        },

        toBePromise : function (util, customEqualityTesters) {
            return {
                compare: function (actual) {
                    var result = {
                        pass: false,
                        message: "Expected value to be a promise."
                    };

                    if (actual &&
                        _.isFunction(actual.done) &&
                        _.isFunction(actual.fail) &&
                        _.isFunction(actual.always) &&
                        _.isFunction(actual.then)) {
                        result.pass = true;
                        result.message = "Expected value not to be a promise.";
                    }

                    return result;
                }
            };
        }
    };
});

