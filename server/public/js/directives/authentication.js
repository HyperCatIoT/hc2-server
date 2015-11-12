"use strict";
/*eslint-env browser*/

angular.module('hypercat.directives')
    .directive('authentication', [
        '$rootScope',
        function($rootScope) {
            var link = function(scope) {
                scope.data = {};
                scope.data.username = '';
                scope.data.password = '';
                scope.data.useAuth = false;

                scope.updateQuery = function() {
                    $rootScope.$emit('authUpdate', scope.data);
                };
            };

            return {
                replace: false,
                templateUrl: 'partials/directives/authentication.html',
                transclude: true,
                link: link
            };
        }
    ]);
