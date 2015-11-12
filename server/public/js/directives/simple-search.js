"use strict";
/*eslint-env browser*/

angular.module('hypercat.directives')
    .directive('simpleSearch', [
        '$rootScope',
        function($rootScope) {
            var link = function(scope) {
                scope.usingFilter = false;
                scope.data = {};
                scope.data.type = 'simpleSearch';
                scope.data.value = {};

                scope.updateQuery = function() {
                    if (scope.usingFilter) {
                        $rootScope.$emit('queryUpdate', scope.data);
                    }
                };

                scope.toggle = function() {
                    if (scope.usingFilter) {
                        scope.updateQuery();
                    } else {
                        $rootScope.$emit('queryUpdate', {});
                    }
                };

                // Untick the checkbox if a different update is made
                $rootScope.$on('queryUpdate', function(event, data) {
                    if ((data !== undefined) && (data.type !== scope.data.type)) {
                        scope.usingFilter = false;
                    }
                });
            };

            return {
                templateUrl: 'partials/directives/simple-search.html',
                link: link
            };
        }
    ]);
