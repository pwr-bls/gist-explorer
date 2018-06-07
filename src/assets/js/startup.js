define(['assets/js/require.conf'], function (requireConfig) {
    var Startup = {
        /**
         * Method init requirejs with config
         */
        initializeRequireJS: function () {
            requirejs.config(requireConfig);
        }
    };
    return Startup;
});