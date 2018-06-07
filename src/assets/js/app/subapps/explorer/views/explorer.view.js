define([
    "marionette",
    "subapps/explorer/templates/explorer.view.jst"
], function (Marionette, explorerJst) {
    "use strict";
    return Marionette.LayoutView.extend({
        className: "col-xs-12",
        template: explorerJst
    });
});