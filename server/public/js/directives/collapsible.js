"use strict";
/*eslint-env browser*/

angular.module('hypercat.directives')
    .directive('collapsible', [
        '$rootScope',
        function($rootScope) {
            var link = function(scope, elem, attrs) {
                scope.visible = false;
                scope.title = attrs.title || attrs.cTitle;
                scope.eventSent = false;

                scope.toggle = function() {
                    scope.visible = !scope.visible;

                    if (scope.title === 'GeoSearch') {
                        $rootScope.$emit('mapOpen', scope.visible);
                    }

                    if (scope.visible) {
                        scope.eventSent = true;
                        $rootScope.$emit('collapsibleOpen', true);
                    }
                };

                $rootScope.$on('collapsibleOpen', function() {
                    if (!scope.eventSent) {
                        scope.visible = false;
                    }

                    scope.eventSent = false;
                });
            };

            return {
                replace: false,
                templateUrl: 'partials/directives/collapsible.html',
                transclude: true,
                link: link,
                scope: {}
            };
        }
    ]);
