"use strict";
/*eslint-env browser*/

angular.module('hypercat.services')
    .service('QueryBuilderService', [
        '$q',
        '$rootScope',
        function($q, $rootScope) {
            var service = {},
                baseQuery = 'http://' + window.location.host + '/cat',
                useAuth = false,
                currentUrl = null,
                currentAuth = {
                    username: null,
                    password: null
                },
                currentFilters = {
                    type: null,
                    value: null
                };

            /**
             * Construct the full Hypercat filtered URL depending on what is
             * currently in the currentUrl string, and currentFilters object
             *
             * @returns {string}
             */
            service.getFullQuery = function() {
                var fullQuery = baseQuery,
                    prop,
                    hasFilters = false,
                    hasUrl = false;

                // Firstly, add the url to the query
                if (currentUrl !== null) {
                    fullQuery += '?url=' + encodeURIComponent(currentUrl);
                    hasUrl = true;
                }

                // Then, check if we need any searches/filters
                if ((currentFilters !== undefined) && (currentFilters.type !== null)) {
                    for (prop in currentFilters.value) {
                        // Ensure the property exists
                        if (currentFilters.value.hasOwnProperty(prop) &&
                            currentFilters.value[prop] !== '') {
                                // Append & or ? if needed
                                if (!hasFilters) {
                                    if (hasUrl) {
                                        fullQuery += '&';
                                    } else {
                                        fullQuery += '?';
                                    }
                                } else {
                                    fullQuery += '&';
                                }

                                // Now append the property to the URL
                                fullQuery += encodeURIComponent(prop) +
                                    '=' +
                                    encodeURIComponent(currentFilters.value[prop]);

                                hasFilters = true;
                        }
                    }
                }

                return fullQuery;
            };

            service.getPostQuery = function() {
                var postQuery = '-H "Content-Type: application/json" -X POST -d \'';
                postQuery += JSON.stringify(currentFilters.value);
                postQuery += '\'';

                return postQuery;
            };

            service.getBasicURL = function() {
                var url = baseQuery;

                // Firstly, add the url to the query
                if (currentUrl !== null) {
                    url += '?url=' + encodeURIComponent(currentUrl);
                }

                return url;
            };

            service.getCurlQuery = function() {
                var curlQuery = 'curl ';

                // Append auth headers
                if (useAuth) {
                    curlQuery += '-H "Authorization: ';
                    curlQuery += btoa(currentAuth.username + ':' + currentAuth.password);
                    curlQuery += '" ';
                }

                // Check if we are using multiSearch
                if (currentFilters.type === 'multi') {
                    curlQuery += service.getPostQuery();
                    curlQuery += ' ' + baseQuery;

                    // Firstly, add the url to the query
                    if (currentUrl !== null) {
                        curlQuery += '?url=' + encodeURIComponent(currentUrl);
                    }
                } else {
                    // Append the URL
                    curlQuery += service.getFullQuery();
                }

                return curlQuery;
            };

            service.objectToQuery = function(object) {
                var query = '',
                    prop;

                for (prop in object) {
                    if (object.hasOwnProperty(prop)) {
                        if (query !== '') {
                            query += '&';
                        }

                        query += prop + '=' + object[prop];
                    }
                }

                return '?' + query;
            };

            service.getAuth = function() {
                if (useAuth) {
                    return {
                        username: currentAuth.username,
                        password: currentAuth.password
                    };
                }

                return false;
            };

            service.urlUpdate = function(data) {
                if (data.type === 'default') {
                    currentUrl = null;
                } else if (data.type === 'custom') {
                    currentUrl = data.value || '';
                }
            };

            service.authUpdate = function(data) {
                useAuth = data.useAuth;
                currentAuth.username = data.username;
                currentAuth.password = data.password;
            };

            service.queryUpdate = function(data) {
                var prop;

                if (data !== undefined) {
                    currentFilters.type = data.type;

                    // Check if we are using multisearch
                    if (data.type !== 'multi') {
                        currentFilters.value = {};

                        for (prop in data.value) {
                            if (data.value.hasOwnProperty(prop)) {
                                currentFilters.value[prop] = data.value[prop];
                            }
                        }
                    } else {
                        currentFilters.value = data.value;
                    }
                }
            };

            service.getCurrentUrl = function() {
                if (currentUrl === null || currentUrl === '') {
                    return baseQuery;
                }
                return currentUrl;
            };

            service.getCurrentValues = function() {
                return currentFilters.value;
            };

            service.isMulti = function() {
                return currentFilters.type === 'multi';
            };

            $rootScope.$on('urlUpdate', function(event, data) {
                service.urlUpdate(data);
            });

            $rootScope.$on('queryUpdate', function(event, data) {
                service.queryUpdate(data);
            });

            $rootScope.$on('authUpdate', function(event, data) {
                service.authUpdate(data);
            });

            return service;
        }
    ]);
