"use strict";
/*eslint-env browser*/
/*global google:false*/

angular.module('hypercat.directives')
    .directive('geoSearch', [
        '$rootScope',
        function($rootScope) {
            var link = function(scope) {
                scope.usingFilter = false;
                scope.data = {};
                scope.data.type = 'geoSearch';
                scope.data.value = {};
                scope.map = null;
                scope.lastOverlay = null;
                scope.showMap = false;
                scope.mapToggleText = 'Pick bounding box on map';
                scope.pointerEvents = false;

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

                scope.enablePointerEvents = function() {
                    scope.pointerEvents = true;
                };

                scope.disablePointerEvents = function() {
                    scope.pointerEvents = false;
                };

                scope.updateQuery = function() {
                    if (scope.usingFilter) {
                        $rootScope.$emit('queryUpdate', scope.data);
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
                        scope.data.value['geobound-minlat'] = sw.lat();
                        scope.data.value['geobound-maxlat'] = ne.lat();
                        scope.data.value['geobound-minlong'] = sw.lng();
                        scope.data.value['geobound-maxlong'] = ne.lng();

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
                templateUrl: 'partials/directives/geo-search.html',
                link: link
            };
        }
    ]);
