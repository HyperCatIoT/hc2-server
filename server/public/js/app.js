'use strict';
/*eslint-env browser*/
// Initialise the application
var app = angular.module('hypercat', [
    // Standard Angular routing module
    'ngRoute',
    // Application modules
    'hypercat.controllers',
    'hypercat.directives',
    'hypercat.services',
    // Third party
    'angular-table',
    'ngNotificationsBar',
    'ngMap'
]);

/* These are the routes */
app.config([
    '$routeProvider',
    'notificationsConfigProvider',
    function($routeProvider, notificationsConfigProvider) {
        // Auto hide
        notificationsConfigProvider.setAutoHide(true);

        // Delay before hide
        notificationsConfigProvider.setHideDelay(3000);

        // Setup routes
        $routeProvider
            .when('/', {
                templateUrl: 'partials/view.html',
                controller: 'ViewCtrl'
            })
            .when('/editor', {
                templateUrl: 'partials/editor.html',
                controller: 'EditorCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
}])
.filter('prettyJson', function() {
    return function(input) {
        // Remove the Angular property
        if (input.$$hashKey) {
            delete input.$$hashKey;
        }
        return JSON.stringify(input, null, "\t");
    };
})
.run([
    /*eslint-disable max-params*/
    function() {

    }]
);
