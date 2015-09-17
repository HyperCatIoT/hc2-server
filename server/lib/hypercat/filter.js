'use strict';
/*jslint node: true */

var tlo = require('../core-utils/tlo'),
    geo = require('../geo/geo'),
    multisearch = require('../multisearch/multisearch');

module.exports = (function() {
    var filterSingleton,

        filter = function () {
            var filterObject = tlo({});

            // Add a prototype method to String allowing us to check
            // whether a string begins with a specific substring
            // I am disabling eslint to allow this prototype, as I am
            // doing a safety check to see if it exists, and the syntax
            // makes a lot of sense to use a prototype method
            if (typeof String.prototype.startsWith !== 'function') {
                /*eslint-disable no-extend-native*/
                String.prototype.startsWith = function(str) {
                    return this.slice(0, str.length) === str;
                };
            }

            /**
             * Check whether any of the metadata for an item matches with
             * the supplied params object (rel, val)
             *
             * @param item
             * @param params
             * @returns {boolean}
             */
            filterObject.checkMetadata = function(item, params) {
                var i,
                    metadata,
                    matches = false;

                // If we are not checking either, it returns true
                if (!params.rel && !params.val) {
                    return true;
                }

                // Loop through the item's metadata
                for (i = 0; i < item['i-object-metadata'].length; i += 1) {
                    metadata = item['i-object-metadata'][i];
                    // Both rel and val needed
                    if (params.rel !== undefined && params.val !== undefined &&
                        (metadata.rel === params.rel) &&
                        (metadata.val === params.val)) {
                            matches = true;
                    // Rel needed
                    } else if (params.rel !== undefined && params.val === undefined &&
                        (metadata.rel === params.rel)) {
                            matches = true;
                    // Val needed
                    } else if (params.rel === undefined && params.val !== undefined &&
                        (metadata.val === params.val)) {
                            matches = true;
                    }
                }

                // Return true or false
                return matches;
            };

            /**
             * Check whether any of the metadata for an item matches with
             * the supplied params object (rel, val)
             *
             * @param item
             * @param params
             * @returns {boolean}
             */
            filterObject.checkMetadataSubstring = function(item, params) {
                var i,
                    metadata,
                    matches = false;

                // This just allows the shorter syntax for rel/val
                params = params || {};
                params.rel = params['substring-rel'];
                params.val = params['substring-val'];

                // If we are not checking either, it returns true
                if (!params.rel && !params.val) {
                    return true;
                }

                // Loop through the item's metadata
                for (i = 0; i < item['i-object-metadata'].length; i += 1) {
                    metadata = item['i-object-metadata'][i];
                    // Both rel and val needed
                    if (params.rel !== undefined && params.val !== undefined &&
                        (metadata.rel.startsWith(params.rel)) &&
                        (metadata.val.startsWith(params.val))) {
                            matches = true;
                    // Rel needed
                    } else if (params.rel !== undefined && params.val === undefined &&
                        (metadata.rel.startsWith(params.rel))) {
                            matches = true;
                    // Val needed
                    } else if (params.rel === undefined && params.val !== undefined &&
                        (metadata.val.startsWith(params.val))) {
                            matches = true;
                    }
                }

                // Return true or false
                return matches;
            };

            /**
             * The method for running a simpleSearch filter
             *
             * @param args
             * @returns {Promise}
             */
            filterObject.simpleSearch = function(args) {
                var filteredDocument = {},
                    document = args.document,
                    params = args.params,
                    i,
                    item,
                    found = false;

                // Clone the document & clear the filteredDocument's items
                filteredDocument = JSON.parse(JSON.stringify(document));
                filteredDocument.items = [];

                return new Promise(function(resolve, reject) {
                    if ((params.rel === undefined) &&
                        (params.val === undefined) &&
                        (params.href === undefined)) {
                            reject('Using SimpleSearch, but no parameters defined');
                    }

                    // Loop through all items
                    for (i = 0; i < document.items.length; i += 1) {
                        found = false;
                        item = document.items[i];

                        // Check the rel and vals
                        if (filterObject.checkMetadata(item, params)) {
                            if (params.href !== undefined) {
                                if (item.href === params.href) {
                                    found = true;
                                }
                            } else {
                                found = true;
                            }
                        }

                        // If the item matches the conditions, add it
                        // to the new items array
                        if (found) {
                            filteredDocument.items.push(item);
                        }
                    }

                    resolve(filteredDocument);
                });
            };


            filterObject.substringSearch = function(args) {
                var filteredDocument = {},
                    doc = args.document,
                    params = args.params,
                    found = false,
                    item,
                    i;

                // Duplicate document and empty items array
                filteredDocument = JSON.parse(JSON.stringify(doc));
                filteredDocument.items = [];

                return new Promise(function(resolve, reject) {
                    if ((params['substring-rel'] === undefined) &&
                        (params['substring-val'] === undefined) &&
                        (params['substring-href'] === undefined)) {
                        reject('Using SubstringSearch with no substring defined');
                    } else {
                        // Loop through all items
                        for (i = 0; i < doc.items.length; i += 1) {
                            found = false;
                            item = doc.items[i];

                            // Check the rel and vals
                            if (filterObject.checkMetadataSubstring(item, params)) {
                                if (params['substring-href'] !== undefined) {
                                    if (item.href.startsWith(params['substring-href'])) {
                                        found = true;
                                    }
                                } else {
                                    found = true;
                                }
                            }

                            // If the item matches the conditions, add it
                            // to the new items array
                            if (found) {
                                filteredDocument.items.push(item);
                            }
                        }

                        resolve(filteredDocument);
                    }
                });
            };

            filterObject.lexicographicSearch = function(args) {
                var filteredDocument = {},
                    doc = args.document,
                    params = args.params,
                    matches = false,
                    item,
                    meta,
                    i,
                    j,
                    value,
                    min = null,
                    max = null;

                // Duplicate document and empty items array
                filteredDocument = JSON.parse(JSON.stringify(doc));
                filteredDocument.items = [];

                return new Promise(function(resolve, reject) {
                    if ((params['lexrange-rel'] === undefined) &&
                        (params['lexrange-min'] === undefined) &&
                        (params['lexrange-max'] === undefined)) {
                        reject('Using LexicographicSearch with no substring defined');
                    } else {
                        if (params['lexrange-min'] !== undefined) {
                            min = String(params['lexrange-min']);
                        }

                        if (params['lexrange-max'] !== undefined) {
                            max = String(params['lexrange-max']);
                        }

                        // Loop through items
                        for (i = 0; i < doc.items.length; i += 1) {
                            item = doc.items[i];
                            matches = false;

                            // Do the initial metadata check
                            if (filterObject.checkMetadata(item, { rel: params['lexrange-rel'] })) {
                                if (min === null && max === null) {
                                    matches = true;
                                } else {
                                    // loop through the item's metadata
                                    for (j = 0; j < item['i-object-metadata'].length; j += 1) {
                                        meta = item['i-object-metadata'][j];

                                        // Check if we are doing the checks on the correct rel
                                        if (meta.rel === params['lexrange-rel']) {
                                            if (matches) {
                                                continue;
                                            }

                                            value = meta.val + "";

                                            // Run the checks
                                            if ((min !== null) && (min <= value) &&
                                                (max !== null) && (max > value)) {
                                                matches = true;
                                            } else if ((max === null) && (min !== null) && (min <= value)) {
                                                matches = true;
                                            } else if ((min === null) && (max !== null) && (max > value)) {
                                                matches = true;
                                            }
                                        }
                                    }
                                }
                            }

                            // If the item matches the conditions, add it
                            // to the new items array
                            if (matches) {
                                filteredDocument.items.push(item);
                            }
                        }

                        resolve(filteredDocument);
                    }
                });
            };

            filterObject.geographicSearch = function(args) {
                var filteredDocument = {},
                    doc = args.document,
                    params = args.params,
                    item,
                    meta,
                    i,
                    j,
                    latRel = 'http://www.w3.org/2003/01/geo/wgs84_pos#lat',
                    longRel = 'http://www.w3.org/2003/01/geo/wgs84_pos#long',
                    minLat = false,
                    maxLat = false,
                    minLong = false,
                    maxLong = false,
                    point = {};

                // Duplicate document and empty items array
                filteredDocument = JSON.parse(JSON.stringify(doc));
                filteredDocument.items = [];

                return new Promise(function(resolve, reject) {
                    if ((params['geobound-minlat'] === undefined) &&
                        (params['geobound-maxlat'] === undefined) &&
                        (params['geobound-minlong'] === undefined) &&
                        (params['geobound-maxlong'] === undefined)) {
                        reject('Using GeographicSearch without search parameters');
                    } else {
                        // Check if we are using each or any param
                        if (params['geobound-minlat'] !== undefined) {
                            minLat = parseFloat(params['geobound-minlat']);
                        }
                        if (params['geobound-maxlat'] !== undefined) {
                            maxLat = parseFloat(params['geobound-maxlat']);
                        }
                        if (params['geobound-minlong'] !== undefined) {
                            minLong = parseFloat(params['geobound-minlong']);
                        }
                        if (params['geobound-maxlong'] !== undefined) {
                            maxLong = parseFloat(params['geobound-maxlong']);
                        }

                        // Loop through all items
                        for (i = 0; i < doc.items.length; i += 1) {
                            item = doc.items[i];
                            point = {};

                            // Loop through the metadata
                            for (j = 0; j < item['i-object-metadata'].length; j += 1) {
                                meta = item['i-object-metadata'][j];

                                if ((meta.rel === latRel) && (point.lat === undefined)) {
                                    point.lat = meta.val;
                                }

                                if ((meta.rel === longRel) && (point.long === undefined)) {
                                    point.long = meta.val;
                                }
                            }

                            // If the item matches the conditions, add it
                            // to the new items array
                            if (geo.isPointWithinBounds({
                                point: point,
                                minLat: minLat,
                                maxLat: maxLat,
                                minLong: minLong,
                                maxLong: maxLong
                            })) {
                                filteredDocument.items.push(item);
                            }
                        }

                        // Resolve the filtered document
                        resolve(filteredDocument);
                    }
                });
            };

            filterObject.detectFiltersAndExecute = function(args) {
                var params = args.params;

                // Check which filter we should be using for the request
                if (params.rel !== undefined ||
                    params.val !== undefined ||
                    params.href !== undefined) {
                        return filterObject.simpleSearch(args);
                } else if (params['substring-rel'] !== undefined ||
                    params['substring-val'] !== undefined ||
                    params['substring-href'] !== undefined) {
                        return filterObject.substringSearch(args);
                } else if (params['lexrange-rel'] !== undefined ||
                    params['lexrange-min'] !== undefined ||
                    params['lexrange-max'] !== undefined) {
                        return filterObject.lexicographicSearch(args);
                } else if (params['geobound-minlat'] !== undefined ||
                    params['geobound-maxlat'] !== undefined ||
                    params['geobound-minlong'] !== undefined ||
                    params['geobound-maxlong'] !== undefined) {
                        return filterObject.geographicSearch(args);
                }

                return Promise.resolve(args.document);
            };

            // curl -H "Content-Type: application/json" -X POST -d '{"intersection": [{"query":"?href=/london"}, {"union": [{"query":"?href=/london"},{"query":"?geobound-minlong=-10"}]}]}' localhost:8060/cat
            filterObject.multiSearch = function(args) {
                var query = args.query,
                    doc = args.document;

                if ((query === undefined) ||
                    (doc === undefined) ||
                    ((query.query === undefined) &&
                    (query.intersection === undefined) &&
                    (query.union === undefined))) {
                        return Promise.reject('Incorrect parameters do a MultiSearch');
                }

                // Pass off the search to the multiSearch lib
                return multisearch.execute({
                    doc: doc,
                    query: query,
                    filter: filterObject
                }).then(function(res) {
                    return Promise.resolve(res);
                });
            };

            return filterObject;
        };
    // Ensure we have a singleton
    if (filterSingleton === undefined) {
        filterSingleton = filter();
    }
    return filterSingleton;
}());
