'use strict';
/*jslint node: true */

var tlo = require('../core-utils/tlo'),
    path = require('path'),
    fs = require('fs'),
    request = require('request'),
    filter = require('./filter'),
    hypercat = require('./hypercat');

module.exports = (function() {
    var documentSingleton,
        exampleHyperCatKey = 'passkey',

        document = function () {
            var documentObject = tlo({});

            /**
             * Retrieve the document using either a local file, or from the
             * specified URL and authorization
             *
             * @param args
             * @returns {Promise}
             */
            documentObject.getDocument = function(args) {
                var examplePath,
                    auth = (args.auth && args.auth !== 'null') ? args.auth : false,
                    splitAuth,
                    headers = {},
                    correctAuth = false,
                    doc,
                    url = documentObject.parseUrl(args.url);

                if (auth !== false) {
                    auth = new Buffer(args.auth.replace(/Basic\s/gi, ''), 'base64')
                        .toString('ascii');
                    headers = {
                        'Authorization': 'Basic ' + auth
                    };
                }

                return new Promise(function(resolve, reject) {
                    // Check if we want the example HyperCat, or if one is specified
                    if (url.isLocal) {
                        // Create the path to the local cat
                        examplePath = path.join(__dirname, '../' + url.url);

                        // Local Auth, should spoof Basic Auth
                        if (auth !== false) {
                            splitAuth = auth.split(':');

                            if (splitAuth[0] === exampleHyperCatKey) {
                                correctAuth = true;
                            }
                        } else {
                            correctAuth = true;
                        }

                        // Local HyperCat
                        if (correctAuth) {
                            fs.readFile(examplePath, function(err, data) {
                                if (!err) {
                                    resolve({
                                        document: JSON.parse(data),
                                        params: args.params
                                    });
                                } else {
                                    reject('Error fetching HyperCat document');
                                }
                            });
                        } else {
                            reject('Invalid authorization');
                        }
                    } else {
                        // Get an external HyperCat
                        request({
                            method: 'GET',
                            url: url.url,
                            headers: headers
                        }, function(err, response, body) {
                            if (!err && response.statusCode === 200) {
                                try {
                                    doc = JSON.parse(body);
                                    resolve({
                                        document: doc,
                                        params: args.params
                                    });
                                } catch(e) {
                                    reject('Error parsing JSON');
                                }
                            } else {
                                reject('Error fetching HyperCat document');
                            }
                        });
                    }
                });
            };

            /**
             * Returns a promise which will filter a document and resolve
             * with a correctly filtered document
             *
             * @param args
             * @returns Promise
             */
            documentObject.parseDocument = function(args) {
                return filter.detectFiltersAndExecute(args);
            };

            /**
             * Parse the given URL and return an object with two properties,
             * the URL and a boolean for whether it is a local URL
             *
             * @param url
             * @returns {{url: string, isLocal: boolean}}
             */
            documentObject.parseUrl = function(url) {
                var urlObj = {
                        url: 'examples/data.json',
                        isLocal: true
                    },
                    localUrls = {
                        'example': 'examples/data.json',
                        'blank': 'examples/empty-catalogue.json',
                        'test-simple': 'examples/test/simple.json',
                        'test-methods': 'examples/test/methods.json',
                        'test-lexicographic': 'examples/test/lexicographic.json',
                        'test-geo': 'examples/test/geo.json'
                    },
                    split,
                    key;

                // If there is no URL, use the default value
                if (url === undefined || url === '') {
                    return urlObj;
                }

                // Split the URL, so we can check if it is a local URL
                split = url.split(':');

                // Do the check
                if (split[0] === 'LOCAL') {
                    urlObj.isLocal = true;

                    for (key in localUrls) {
                        if (localUrls.hasOwnProperty(key) &&
                            key === split[1]) {
                                urlObj.url = localUrls[key];
                        }
                    }
                } else {
                    urlObj.url = url;
                    urlObj.isLocal = false;
                }

                return urlObj;
            };

            documentObject.addItem = function(args) {
                return new Promise(function(resolve, reject) {
                    if (args === undefined ||
                        args.doc === undefined ||
                        args.data === undefined) {
                            reject('Invalid parameters for adding an item');
                    } else {
                        // Check if item is valid
                        if ((args.data.href !== undefined) &&
                            (args.data.href !== '')) {
                                // The document should be valid by this point already, so
                                // manipulations can be made directly to it
                                args.doc.items.push(args.data);
                                resolve({
                                    doc: args.doc,
                                    item: args.data
                                });
                        } else {
                            reject('Item is missing the href attribute');
                        }

                    }
                });
            };

            documentObject.updateItem = function(args) {
                var item,
                    i,
                    found = false,
                    newDoc;

                return new Promise(function(resolve, reject) {
                    if (args === undefined ||
                        args.doc === undefined ||
                        args.href === undefined ||
                        args.data === undefined) {
                            reject('Invalid parameters for updating an item');
                    } else {
                        // Clone the document
                        newDoc = JSON.parse(JSON.stringify(args.doc));

                        // Find the item that we want to update
                        for (i = 0; i < newDoc.items.length; i += 1) {
                            item = newDoc.items[i];
                            if (item.href === args.href) {
                                // Update the item
                                newDoc.items[i] = args.data;
                                found = true;
                                break;
                            }
                        }

                        // Check if the item was found
                        if (found) {
                            resolve({doc: newDoc, item: args.data});
                        } else {
                            reject('Specified item not found in catalogue');
                        }
                    }
                });
            };

            documentObject.deleteItem = function(args) {
                var i;

                return new Promise(function(resolve, reject) {
                    if (args === undefined ||
                        args.doc === undefined ||
                        args.href === undefined) {
                            reject('Invalid parameters for adding an item');
                    } else {
                        // Loop through all items to find the matching one
                        for (i = 0; i < args.doc.items.length; i += 1) {
                            if (args.doc.items[i].href === args.href) {
                                // Remove the item from the array
                                args.doc.items.splice(i, 1);
                            }
                        }

                        resolve(args.doc);
                    }
                });
            };

            documentObject.save = function(args) {
                var urlObj,
                    fullPath,
                    prettyJson;

                return new Promise(function(resolve, reject) {
                    if (args === undefined ||
                        args.doc === undefined) {
                            reject('Invalid parameters for saving a document');
                    } else {
                        if (hypercat.checkValid(args.doc)) {
                            urlObj = documentObject.parseUrl(args.url);

                            if (!urlObj.isLocal) {
                                reject('Can only modify and save local documents');
                            } else {
                                fullPath = path.join(__dirname, '../' + urlObj.url);
                                prettyJson = JSON.stringify(args.doc, null, '    ');

                                fs.writeFile(fullPath, prettyJson, function(err) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            }
                        } else {
                            reject('Error with HyperCat validating before saving');
                        }
                    }
                });
            };

            return documentObject;
        };

    // Ensure we have a singleton
    if (documentSingleton === undefined) {
        documentSingleton = document();
    }
    return documentSingleton;
}());
