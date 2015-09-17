'use strict';
/*jslint node: true */

var tlo = require('../core-utils/tlo'),
    filter = require('../hypercat/filter');

module.exports = (function() {
    var multiSingleton,

        multi = function () {
            var multiObject = tlo({}),
                privates = {};

            privates.searches = {
                // INTERSECTION / AND
                intersection: function(doc, node) {
                    var i,
                        promises = [],
                        resultList = [],
                        uniqueMap = new Map(),
                        itemArray;

                    if (node.constructor === Array) {
                        for (i = 0; i < node.length; i += 1) {
                            promises.push(multiObject.compare(doc, node[i]));
                        }

                        return Promise.all(promises).then(function(res) {
                            res.forEach(function(result) {
                                if (result.constructor === Array) {
                                    itemArray = result;
                                } else {
                                    itemArray = result.items;
                                }

                                itemArray.forEach(function(item) {
                                    if (uniqueMap.has(item.href)) {
                                        uniqueMap.set(item.href, {
                                            item: item,
                                            count: uniqueMap.get(item.href).count + 1
                                        });
                                    } else {
                                        uniqueMap.set(item.href, {
                                            item: item,
                                            count: 1
                                        });
                                    }
                                });
                            });

                            uniqueMap.forEach(function(mapItem) {
                                if (mapItem.count === res.length) {
                                    resultList.push(mapItem.item);
                                }
                            });

                            return Promise.resolve(resultList);
                        });
                    }

                    return multiObject.compare(doc, node);
                },
                // UNION / OR
                union: function(doc, node) {
                    var i,
                        promises = [],
                        uniqueMap = new Map(),
                        resultList = [],
                        itemArray;

                    if (node.constructor === Array) {
                        for (i = 0; i < node.length; i += 1) {
                            promises.push(multiObject.compare(doc, node[i]));
                        }

                        return Promise.all(promises).then(function(res) {
                            res.forEach(function(result) {
                                if (result.constructor === Array) {
                                    itemArray = result;
                                } else {
                                    itemArray = result.items;
                                }

                                itemArray.forEach(function(item) {
                                    if (!uniqueMap.has(item.href)) {
                                        uniqueMap.set(item.href, {
                                            item: item
                                        });
                                    }
                                });
                            });

                            uniqueMap.forEach(function(mapItem) {
                                resultList.push(mapItem.item);
                            });

                            return Promise.resolve(resultList);
                        });
                    }

                    return multiObject.compare(doc, node);
                },
                // QUERY / use a filter
                query: function(doc, node) {
                    var parsedFilters = {};
                    parsedFilters.params = multiObject.queryStringToFilters(node);
                    parsedFilters.document = doc;

                    return filter.detectFiltersAndExecute(parsedFilters).then(function(res) {
                        if (res.constructor === Array) {
                            return Promise.resolve(res);
                        }

                        return Promise.resolve(res.items);
                    });
                }
            };

            /**
             * Parse a URL query string into the filters that are required
             */
            multiObject.queryStringToFilters = function(query) {
                var split = query.split(/[?&]/),
                    filters = {},
                    pair,
                    i;

                for (i = 0; i < split.length; i += 1) {
                    // Check the string isn't empty
                    if (split[i] !== '') {
                        pair = split[i].split('=');

                        // Add the filter to the array
                        filters[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                    }
                }

                return filters;
            };

            /**
             * Decide which of the private comparisons (intersection/union/query)
             * to use to continue evaluating the query
             */
            multiObject.compare = function(doc, node) {
                var key = Object.keys(node)[0];
                if (privates.searches[key] !== undefined) {
                    return privates.searches[key](doc, node[key]);
                }

                return Promise.reject('Unrecognized MultiSearch comparison');
            };

            /**
             * The main entry point for multisearch
             */
            multiObject.execute = function(args) {
                if ((args === undefined) ||
                    (args.doc === undefined) ||
                    (args.query === undefined) ||
                    (args.filter === undefined)) {
                        return Promise.reject('Invalid MultiSearch parameters');
                }

                // Setup the filter object as passed in. Requiring it does not
                // seem to work from this lib
                filter = args.filter;

                return multiObject.compare(args.doc, args.query).then(function(items) {
                    args.doc.items = items;

                    return Promise.resolve(args.doc);
                });
            };

            return multiObject;
        };
    // Ensure we have a singleton
    if (multiSingleton === undefined) {
        multiSingleton = multi();
    }
    return multiSingleton;
}());
