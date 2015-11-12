"use strict";
/*eslint-env browser*/
/*global google:false*/

angular.module('hypercat.directives')
    .directive('geoDateSearch', [
        '$rootScope',
        'QueryBuilderService',
        function($rootScope, QueryBuilderService) {
            var link = function(scope) {
                scope.usingFilter = false;
                scope.data = {};
                scope.data.type = 'multi';
                scope.data.value = {
                    geo: {},
                    date: {}
                };
                scope.map = null;
                scope.lastOverlay = null;
                scope.showMap = false;
                scope.mapToggleText = 'Pick bounding box on map';
                scope.pointerEvents = false;

                scope.enablePointerEvents = function() {
                    scope.pointerEvents = true;
                };

                scope.disablePointerEvents = function() {
                    scope.pointerEvents = false;
                };

                scope.toggle = function() {
                    if (scope.usingFilter) {
                        scope.updateQuery();
                    } else {
                        $rootScope.$emit('queryUpdate', {});
                    }
                };

                scope.toggleMap = function() {
                    scope.showMap = !scope.showMap;

                    if (scope.showMap) {
                        scope.mapToggleText = 'Hide Map';
                    } else {
                        scope.mapToggleText = 'Pick bounding box on map';
                    }
                };

                scope.updateQuery = function() {
                    var isoDate = {},
                        rel = scope.data.value.date['lexrange-rel'],
                        minDate = scope.data.value.date['lexrange-min'],
                        maxDate = scope.data.value.date['lexrange-max'];

                    if (scope.usingFilter) {
                        if (rel !== undefined) {
                            isoDate['lexrange-rel'] = rel;
                        }
                        if (minDate !== undefined) {
                            isoDate['lexrange-min'] = new Date(minDate).toISOString();
                        }
                        if (maxDate !== undefined) {
                            isoDate['lexrange-max'] = new Date(maxDate).toISOString();
                        }

                        $rootScope.$emit('queryUpdate', {
                            type: scope.data.type,
                            value: {
                                "intersection": [
                                    {"query": QueryBuilderService.objectToQuery(scope.data.value.geo)},
                                    {"query": QueryBuilderService.objectToQuery(isoDate)}
                                ]
                            }
                        });
                    }
                };

                scope.$on('mapInitialized', function(e, map) {
                    var drawingManager;

                    // Save the map to the scope
                    scope.map = map;

                    // Setup the drawingManager
                    drawingManager = new google.maps.drawing.DrawingManager({
                        drawingMode: google.maps.drawing.OverlayType.MARKER,
                        drawingControl: true,
                        drawingControlOptions: {
                          position: google.maps.ControlPosition.TOP_CENTER,
                          drawingModes: [
                            google.maps.drawing.OverlayType.RECTANGLE
                          ]
                        }
                    });

                    google.maps.event.addListener(drawingManager, "rectanglecomplete", function(event) {
                        var bounds = event.getBounds(),
                            ne = bounds.getNorthEast(),
                            sw = bounds.getSouthWest();

                        if (scope.lastOverlay !== null) {
                            scope.lastOverlay.setMap(null);
                        }

                        // Update the fields with lats and longs
                        scope.data.value.geo['geobound-minlat'] = sw.lat();
                        scope.data.value.geo['geobound-maxlat'] = ne.lat();
                        scope.data.value.geo['geobound-minlong'] = sw.lng();
                        scope.data.value.geo['geobound-maxlong'] = ne.lng();

                        scope.lastOverlay = event; // Save it
                        scope.lastOverlay.setMap(map);
                        drawingManager.setDrawingMode(null); // Return to 'hand' mode

                        scope.updateQuery();
                        scope.$apply();
                    });

                    // Add the drawingManager to the map
                    drawingManager.setMap(map);
                });

                // Untick the checkbox if a different update is made
                $rootScope.$on('queryUpdate', function(event, data) {
                    if ((data !== undefined) && (data.type !== scope.data.type)) {
                        scope.usingFilter = false;
                    }
                });

                $rootScope.$on('mapOpen', function() {
                    setTimeout(function() {
                        if (scope.map !== null) {
                            google.maps.event.trigger(scope.map, 'resize');
                        }
                    }, 100);
                });
            };

            return {
                templateUrl: 'partials/directives/geo-date-search.html',
                link: link
            };
        }
    ]);
