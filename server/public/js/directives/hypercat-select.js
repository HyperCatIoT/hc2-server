"use strict";
/*eslint-env browser*/

angular.module('hypercat.directives')
    .directive('hypercatSelect', [
        '$rootScope',
        function($rootScope) {
            var link = function(scope) {
                scope.catType = 'default';
                scope.editorEnabled = true;

                // Check if we are using the hosted version
                if (window.location.hostname === 'hypercat.1248.io') {
                    scope.editorEnabled = false;
                }

                scope.selectCustom = function() {
                    scope.catType = 'custom';
                };

                scope.updateUrl = function() {
                    $rootScope.$emit('urlUpdate', {
                        type: scope.catType,
                        value: scope.customUrl
                    });
                };
            };

            return {
                replace: false,
                templateUrl: 'partials/directives/hypercat-select.html',
                link: link
            };
        }
    ]);
