"use strict";
/*eslint-env browser*/

angular.module('hypercat.services')
    .service('CatService', [
        '$http',
        '$q',
        '$rootScope',
        function($http, $q, $rootScope) {
            var service = {};

            /**
             * Send a POST request to the API containing the new URL
             * and description
             *
             * @param args
             * @returns {Promise}
             */
            service.post = function(args) {
                var defer = $q.defer(),
                    dataToSend = {};

                // Ensure the URL is valid
                if (service.isUrlValid(args.url)) {
                    dataToSend = {
                        url: args.url,
                        description: args.description || ''
                    };

                    // Send the POST request to the server
                    $http({
                        method: 'POST',
                        url: '/cat',
                        data: dataToSend
                    }).success(function() {
                        defer.resolve();
                    }).error(function(data, status) {
                        if (status === 400) {
                            defer.reject(data);
                        } else {
                            defer.reject('An error occurred when sending data to the API');
                        }
                    });
                } else {
                    defer.reject('Invalid URL');
                }

                return defer.promise;
            };

            /**
             * Get the full Hypercat catalogue from /cat
             *
             * @returns {Promise}
             */
            service.get = function(url) {
                var defer = $q.defer();

                if (!url || url === null) {
                    url = '/cat';
                }

                $http({
                    method: 'GET',
                    url: url
                }).success(function(data) {
                    defer.resolve(data);
                }).error(function(data, status) {
                    if (status === 400) {
                        defer.reject(data);
                    } else {
                        defer.reject('An error occurred when sending data to the API');
                    }
                });

                return defer.promise;
            };

            /**
             * A more advanced version of the basic "get" method, which
             * also allows for auth to be included in the request
             *
             * @param args
             * @returns {*}
             */
            service.execute = function(args) {
                var url = args.url,
                    auth = args.auth || null,
                    method = args.method || 'GET',
                    data = args.data || null,
                    defer = $q.defer();

                // Execute a loading notification
                service.notify(false, {});

                // Check if we need to inlude an auth
                if (auth) {
                    $http.defaults.headers.common.Authorization = 'Basic ' +
                        btoa(auth.username + ':' + auth.password);
                } else {
                    $http.defaults.headers.common.Authorization = null;
                }

                // Check if we are using local Hypercat
                if (!url || url === null) {
                    url = '/cat';
                }

                // Send request to server
                $http({
                    method: method,
                    url: url,
                    data: data
                }).success(function(d) {
                    service.notify(false, d);
                    defer.resolve(d);
                }).error(function(d, status) {
                    if (status === 400) {
                        service.notify(true, d);
                        defer.reject(d);
                    } else {
                        service.notify(true, 'An error occurred when sending data to the API');
                        defer.reject('An error occurred when sending data to the API');
                    }
                });

                return defer.promise;
            };

            service.getSimpleCatalogueItems = function() {
                var defer = $q.defer(),
                    items = [],
                    simpleItems = [],
                    simpleItem = {},
                    json,
                    metadata,
                    i, j;

                service.get().then(function(catalogue) {
                    json = JSON.parse(catalogue);
                    items = json.items;

                    for (i = 0; i < items.length; i += 1) {
                        // Add the href
                        simpleItem = {
                            href: items[i].href
                        };

                        // Try and find the description to add to the object
                        for (j = 0; j < items[i]['item-metadata'].length; j += 1) {
                            metadata = items[i]['item-metadata'][j];
                            if (metadata.rel === 'urn:X-hypercat:rels:hasDescription:en') {
                                simpleItem.description = metadata.val;
                            }
                        }

                        simpleItems.push(simpleItem);
                    }

                    defer.resolve(simpleItems);
                }).catch(function(err) {
                    defer.reject(err);
                });

                return defer.promise;
            };

            /**
             * Send notificationUpdate on the rootScope, for the notification
             * panel to use the data from
             *
             * @param err
             * @param data
             */
            service.notify = function(err, data) {
                var numberOfItems = 0;

                if (err) {
                    $rootScope.$emit('notificationUpdate', {
                        error: true,
                        message: data
                    });
                } else {
                    if (data.items !== undefined) {
                        numberOfItems = data.items.length;

                        $rootScope.$emit('notificationUpdate', {
                            error: false,
                            items: numberOfItems
                        });
                    } else {
                        $rootScope.$emit('notificationUpdate', {
                            error: false,
                            loading: true
                        });
                    }
                }
            };

            return service;
        }
    ]);
