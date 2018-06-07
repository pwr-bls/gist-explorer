define([
    "marionette"
], function (Marionette) {
    "use strict";

    return Marionette.Object.extend({
        generateUrl: function (argsArr) {
            argsArr = argsArr || [];
            if (this.urlRootPrefix) {
                args.unshift(this.urlRootPrefix);
            }
            return argsArr.join("/");
        },
        onDestroy: function () {
            if (this.controller) {
                this.controller.destroy();
            }
            if (this.api) {
                this.api.destroy();
            }
        }
    });
});