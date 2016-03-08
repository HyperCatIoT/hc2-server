'use strict';
/*jslint node: true */

var request = require('request'),
    tlo = require('../core-utils/tlo');

module.exports = (function() {
    var hypercatSingleton,

        hypercat = function() {
            var hypercatObject = tlo({});

            /**
             * Check whether the given JSON is a valid Hypercat doc
             *
             * @param json
             * @returns {Promise}
             */
            hypercatObject.checkValid = function(args) {
                var json = args.document;

                if (args.hasOwnProperty('catalogue-metadata')) {
                    json = args;
                }

                return new Promise(function(resolve, reject) {
                    // Do all of the basic checks on the JSON object
                    if ((json !== undefined) &&
                        (json['catalogue-metadata'] !== undefined) &&
                        (json['catalogue-metadata'].constructor === Array) &&
                        (json.items !== undefined) &&
                        (json.items.constructor === Array)) {
                            return hypercatObject.checkIfItemsValid(json).then(function() {
                                resolve({
                                    document: json,
                                    params: args.params
                                });
                            }).catch(function(err) {
                                reject(err);
                            });
                    }

                    // If any of the conditionals fail
                    reject('Invalid Hypercat format (only Hypercat 3+ supported)');
                });
            };

            /**
             * Loop through the item array and check to ensure that each
             * item is valid
             *
             * @param itemsArray
             * @returns {Promise}
             */
            hypercatObject.checkIfItemsValid = function(doc) {
                var error = false,
                    i,
                    j,
                    itemMetadata,
                    prop,
                    descriptionFound = false,
                    itemsArray = doc.items,
                    foundHrefs = [];

                return new Promise(function(resolve, reject) {
                    if (itemsArray === undefined) {
                        reject('The items array is undefined');
                    } else if (itemsArray.length === 0) {
                        // it is fine to have no items
                        resolve();
                    } else {
                        // Loop through items
                        for (i = 0; i < itemsArray.length; i += 1) {
                            itemMetadata = itemsArray[i]['item-metadata'];
                            if (itemMetadata !== undefined) {
                                descriptionFound = false;

                                // Loop through metadata properties
                                for (j = 0; j < itemMetadata.length; j += 1) {
                                    prop = itemMetadata[j];
                                    if (prop.rel === 'urn:X-hypercat:rels:hasDescription:en') {
                                        descriptionFound = true;
                                    }

                                    // Ensure all values are strings
                                    if (typeof prop.val !== 'string') {
                                        error = true;
                                    }
                                }

                                // Check if a description was found
                                if (!descriptionFound) {
                                    error = true;
                                }
                            } else {
                                error = true;
                            }

                            // Do the checks on the item's href
                            if ((itemsArray[i].href !== undefined) &&
                                (itemsArray[i] !== '') &&
                                (foundHrefs.indexOf(itemsArray[i].href) === -1)) {
                                foundHrefs.push(itemsArray[i].href);
                            } else {
                                error = true;
                            }
                        }

                        // Resolve or reject based on the error boolean
                        if (error === false) {
                            resolve(doc);
                        } else {
                            reject('Error when validating items array');
                        }
                    }
                });
            };

            /**
             * Check the supplied JSON to ensure the contentType metadata
             * matches a catalog
             *
             * @param json
             * @returns {Promise}
             */
            hypercatObject.checkIfCatalog = function(json) {
                var metadata = json['catalogue-metadata'],
                    isCatalog = false,
                    isOldCatalog = false,
                    i;

                return new Promise(function(resolve, reject) {
                    // Loop through the metadata to ensure we have the
                    // correct contentType on the document
                    for (i = 0; i < metadata.length; i += 1) {
                        if ((metadata[i].rel === 'urn:X-hypercat:rels:isContentType') &&
                            (metadata[i].val === 'application/vnd.hypercat.catalogue+json')) {
                                isCatalog = true;
                        } else if (metadata[i].rel === 'urn:X-tsbiot:rels:isContentType') {
                            isOldCatalog = true;
                        }
                    }

                    // Now resolve or reject the promise
                    if (isCatalog) {
                        resolve(json);
                    } else {
                        if (isOldCatalog) {
                            reject('Hypercat document is an old format. Please update to V2');
                        } else {
                            reject('Document is not a catalogue');
                        }
                    }
                });
            };

            /**
             * Fetch a Hypercat document from a URL, this should be
             * checked with checkValid() after retrieving
             *
             * @param url
             * @returns {Promise}
             */
            hypercatObject.fetchDocument = function(url) {
                var json;
                return new Promise(function(resolve, reject) {
                    request({
                        method: 'GET',
                        url: url
                    }, function(err, response, body) {
                        if (err || response.statusCode !== 200) {
                            reject('Error fetching URL');
                        } else {
                            try {
                                json = JSON.parse(body);

                                // Check if the document is valid before returning it
                                return hypercatObject.checkValid(json).then(function() {
                                    resolve(json);
                                }).catch(function(error) {
                                    reject(error);
                                });
                            } catch(e) {
                                reject('Error parsing JSON document');
                            }
                        }
                    });
                });
            };

            return hypercatObject;
        };

    // Ensure we have a singleton
    if (hypercatSingleton === undefined) {
        hypercatSingleton = hypercat();
    }
    return hypercatSingleton;
}());
