"use strict";
/*eslint-env browser*/

angular.module('hypercat.directives')
    .directive('lexicographicSearch', [
        '$rootScope',
        function($rootScope) {
            var link = function(scope) {
                scope.usingFilter = false;
                scope.data = {};
                scope.data.type = 'lexicographicSearch';
                scope.data.value = {};
                scope.usingDates = false;
                scope.dates = {
                    start: null,
                    end: null
                };

                scope.updateQuery = function() {
                    var formattedData = JSON.parse(JSON.stringify(scope.data)),
                        date;

                    if (scope.usingFilter) {
                        // Format min date
                        if (scope.usingDates && scope.data.value['lexrange-min']) {
                            date = new Date(scope.data.value['lexrange-min']);
                            formattedData.value['lexrange-min'] = date.toISOString();
                        }

                        // Format max date
                        if (scope.usingDates && scope.data.value['lexrange-max']) {
                            date = new Date(scope.data.value['lexrange-max']);
                            formattedData.value['lexrange-max'] = date.toISOString();
                        }

                        $rootScope.$emit('queryUpdate', formattedData);
                    }
                };

                scope.updateDate = function(type) {
                    var date;

                    if (type === 'start') {
                        date = new Date(scope.dates.start);
                        console.log(date.toISOString());
                        scope.data.value['lexrange-min'] = date.toISOString();
                    } else if (type === 'end') {
                        date = new Date(scope.dates.end);
                        scope.data.value['lexrange-max'] = date.toISOString();
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
                templateUrl: 'partials/directives/lexi-search.html',
                link: link
            };
        }
    ]);
