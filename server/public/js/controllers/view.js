"use strict";
/*eslint-env browser*/
/*global google:false, swal:false */

angular.module('hypercat.controllers')
    .controller('ViewCtrl', [
        '$scope',
        '$rootScope',
        'CatService',
        'QueryBuilderService',
        /*eslint-disable max-params*/
        function($scope, $rootScope, CatService, QueryBuilderService) {
            $scope.data = null;
            $scope.catType = 'default';
            $scope.customUrl = '';
            $scope.notification = null;
            $scope.isMenuVisible = false;
            $scope.mapView = false;
            $scope.markers = [];
            $scope.infoWindows = [];
            $scope.map = null;
            $scope.isGeo = false;

            $scope.getQuery = function() {
                return QueryBuilderService.getCurlQuery();
            };

            $scope.selectCustom = function() {
                $scope.catType = 'custom';
            };

            $scope.toggleMenu = function() {
                if ($scope.isMenuVisible) {
                    $scope.isMenuVisible = false;
                    document.body.className = '';
                } else {
                    $scope.isMenuVisible = true;
                    document.body.className = 'menu-open';
                }
            };

            $scope.toggleMapView = function() {
                $scope.mapView = !$scope.mapView;
            };

            $scope.toggleMapViewText = function() {
                if ($scope.mapView) {
                    return 'JSON View';
                }

                return 'Map View';
            };

            $scope.runQuery = function() {
                var auth = QueryBuilderService.getAuth(),
                    isGeo,
                    meta,
                    point,
                    i,
                    j,
                    infoWindow,
                    newMarker,
                    executeQuery = {},
                    infoWindowListener = function() {
                        infoWindow.setContent(this.infoContent);
                        infoWindow.open($scope.map, this);
                    };

                if (QueryBuilderService.isMulti()) {
                    executeQuery = {
                        url: QueryBuilderService.getBasicURL(),
                        auth: auth,
                        method: 'POST',
                        data: QueryBuilderService.getCurrentValues()
                    };
                } else {
                    // Basic GET
                    executeQuery = {
                        url: QueryBuilderService.getFullQuery(),
                        auth: auth
                    };
                }

                CatService.execute(executeQuery).then(function(data) {
                    $scope.data = data;

                    // Remove old markers
                    for (i = 0; i < $scope.markers.length; i += 1) {
                        $scope.markers[i].setMap(null);
                    }
                    $scope.markers = [];

                    infoWindow = new google.maps.InfoWindow({
                        content: JSON.stringify(data.items, null, '\t')
                    });

                    // Check the items array to see if we have a possibility
                    // to notify the user about a map display
                    for (i = 0; i < data.items.length; i += 1) {
                        point = {};
                        for (j = 0; j < data.items[i]['item-metadata'].length; j += 1) {
                            meta = data.items[i]['item-metadata'][j];

                            if (meta.rel === 'http://www.w3.org/2003/01/geo/wgs84_pos#lat') {
                                isGeo = true;
                                point.lat = meta.val;
                            }

                            if (meta.rel === 'http://www.w3.org/2003/01/geo/wgs84_pos#long') {
                                isGeo = true;
                                point.long = meta.val;
                            }
                        }

                        if (point.lat && point.long) {
                            newMarker = new google.maps.Marker({
                                position: new google.maps.LatLng(point.lat, point.long),
                                map: $scope.map
                            });

                            newMarker.infoContent = '<pre>' + JSON.stringify(data.items[i], null, '\t') + '</pre>';

                            newMarker.addListener('click', infoWindowListener);

                            $scope.infoWindows.push(infoWindow);
                            $scope.markers.push(newMarker);
                        }
                    }

                    // Check if the data returned contains geo data
                    if (isGeo && !$scope.mapView) {
                        $scope.isGeo = true;
                        swal({
                            title: "Geographic Data?",
                            text: "It looks like you have Geographic data, would you like to view as a map instead of JSON?",
                            type: "info",
                            showCancelButton: true,
                            confirmButtonColor: "#5ab500",
                            confirmButtonText: "Show as Map",
                            cancelButtonText: "Show as JSON",
                            closeOnConfirm: true
                        }, function(isConfirm) {
                            if (isConfirm) {
                                $scope.$apply(function() {
                                    $scope.mapView = true;
                                });
                            }
                        });
                    }
                }).catch(function() {
                    $scope.data = {};
                });
            };

            $scope.copyCurlToClipboard = function() {
                var curl = QueryBuilderService.getCurlQuery(),
                    textArea = document.createElement("textarea");

                // Place in top-left corner of screen regardless of scroll position.
                textArea.style.position = 'fixed';
                textArea.style.top = 0;
                textArea.style.left = 0;

                // Ensure it has a small width and height. Setting to 1px / 1em
                // doesn't work as this gives a negative w/h on some browsers.
                textArea.style.width = '2em';
                textArea.style.height = '2em';

                // We don't need padding, reducing the size if it does flash render.
                textArea.style.padding = 0;

                // Clean up any borders.
                textArea.style.border = 'none';
                textArea.style.outline = 'none';
                textArea.style.boxShadow = 'none';

                // Avoid flash of white box if rendered for any reason.
                textArea.style.background = 'transparent';

                textArea.value = curl;
                document.body.appendChild(textArea);
                textArea.select();

                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.log('Unable to copy');
                }

                document.body.removeChild(textArea);
            };

            $scope.$on('mapInitialized', function(event, map) {
                var i;

                $scope.map = map;

                for (i = 0; i < $scope.markers.length; i += 1) {
                    $scope.markers[i].setMap(map);
                }
            });

            $rootScope.$on('notificationUpdate', function(e, data) {
                $scope.notification = data;
            });

            $rootScope.$on('toggleMenu', function() {
                $scope.toggleMenu();
            });
        }
    ]);
