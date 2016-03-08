'use strict';
/*jslint node: true */

var tlo = require('../core-utils/tlo'),
    hypercat = require('../hypercat/hypercat'),
    document = require('../hypercat/document'),
    filter = require('../hypercat/filter');

module.exports = (function() {
    var catSingleton,

        cat = function() {
            var catObject = tlo({}),
                privates = {};

            privates.isEditorEnabled = function() {
                var enabled = true;

                process.argv.forEach(function(arg) {
                    if (arg === '-no-editor') {
                        enabled = false;
                    }
                });

                return enabled;
            };

            /**
             * Attach any GET, POST, PUT, DELETE routes to the app
             */
            privates.attachRoute = function() {
                var app = privates.app;

                /**
                 * Route: GET /cat
                 */
                app.get('/cat', function(req, res) {
                    var url = req.query.url,
                        params = req.query,
                        auth = req.headers.authorization;

                    // Chain of promises to get/parse and return the document
                    document.getDocument({
                            url: url,
                            params: params,
                            auth: auth
                        })
                        .then(hypercat.checkValid)
                        .then(document.parseDocument)
                        .then(function(data) {
                            // Send a successful response
                            res.contentType('application/json').status(200).send(data);
                        })
                        .catch(function(err) {
                            // Send an error message
                            res.status(400).send(err);
                        });
                });

                /**
                 * Route: POST /cat
                 */
                 // curl -H "Content-Type: application/json" -X POST -d '{"item-metadata": [{"val": "something","rel": "reference"}],"href": "/something"}' localhost:8060/cat?url=LOCAL:blank
                app.post('/cat', function(req, res) {
                    var url = req.query.url,
                        params = req.query,
                        auth = req.headers.authorization;

                    // Use a similar promise chain as the GET method, this time
                    // also including the updateDocument method
                    document.getDocument({
                        url: url,
                        params: params,
                        auth: auth
                    })
                    .then(hypercat.checkValid)
                    .then(function(doc) {
                        if ((req.body.query !== undefined) ||
                            (req.body.intersection !== undefined) ||
                            (req.body.union !== undefined)) {
                                // We are POSTing for a MultiSearch
                                return filter.multiSearch({
                                    document: doc.document,
                                    query: req.body
                                }).then(function(result) {
                                    res.status(200).send(result);
                                }).catch(function(err) {
                                    res.status(400).send(err);
                                });
                        }

                        // Check if the editor is enabled
                        if (!privates.isEditorEnabled()) {
                            return Promise.reject('Editor disabled on hosted version');
                        }

                        // We are POSTing to add an item to the array
                        document.addItem({
                            doc: doc.document,
                            data: req.body
                        }).then(function(resDoc) {
                            hypercat.checkIfItemsValid(resDoc.doc)
                                .then(function() {
                                    document.save({doc: resDoc.doc, url: url})
                                        .then(function() {
                                            // Send a successful response
                                            res.contentType('application/json').status(200).send({});
                                        }).catch(function(err) {
                                            res.status(400).send(err);
                                        });
                                }).catch(function(err) {
                                    res.status(400).send(err);
                                });
                        }).catch(function(err) {
                            res.status(400).send(err);
                        });
                    })
                    .catch(function(err) {
                        res.status(400).send(err);
                    });
                });

                /**
                 * Route: PUT /cat
                 */
                 // curl -H "Content-Type: application/json" -X PUT -d '{"item-metadata": [{"val": "one","rel": "two"}],"href": "/something"}' "localhost:8060/cat?url=LOCAL:blank&href=%2Fsomething"
                app.put('/cat', function(req, res) {
                    var url = req.query.url,
                        params = req.query,
                        auth = req.headers.authorization;

                    // Check if the editor is enabled
                    if (!privates.isEditorEnabled()) {
                        res.status(400).send('Editor disabled on hosted version');
                        return;
                    }

                    // Use a similar promise chain as the GET method, this time
                    // also including the updateDocument method
                    document.getDocument({
                        url: url,
                        params: params,
                        auth: auth
                    })
                    .then(hypercat.checkValid)
                    .then(function(result) {
                        document.updateItem({
                            doc: result.document,
                            href: req.query.href,
                            data: req.body
                        }).then(function(itemRes) {
                            hypercat.checkIfItemsValid(itemRes.doc)
                                .then(function() {
                                    document.save({doc: itemRes.doc, url: url})
                                        .then(function() {
                                            // Send a successful response
                                            res.contentType('application/json').status(200).send({});
                                        }).catch(function(err) {
                                            res.status(400).send(err);
                                        });
                                }).catch(function(err) {
                                    res.status(400).send(err);
                                });
                        }).catch(function(err) {
                            res.status(400).send(err);
                        });
                    }).catch(function(err) {
                        res.status(400).send(err);
                    });
                });

                /**
                 * Route: DELETE /cat
                 */
                app.delete('/cat', function(req, res) {
                    var url = req.query.url,
                        params = req.query,
                        auth = req.headers.authorization;

                    // Check if the editor is enabled
                    if (!privates.isEditorEnabled()) {
                        res.status(400).send('Editor disabled on hosted version');
                        return;
                    }

                    // Use a similar promise chain as the GET method, this time
                    // also including the updateDocument method
                    document.getDocument({
                        url: url,
                        params: params,
                        auth: auth
                    })
                    .then(hypercat.checkValid)
                    .then(function(result) {
                        document.deleteItem({
                            doc: result.document,
                            href: req.query.href
                        }).then(function(itemRes) {
                            hypercat.checkIfItemsValid(itemRes)
                                .then(function() {
                                    document.save({doc: itemRes, url: url})
                                        .then(function() {
                                            // Send a successful response
                                            res.contentType('application/json').status(200).send({});
                                        }).catch(function(err) {
                                            res.status(400).send(err);
                                        });
                                }).catch(function(err) {
                                    res.status(400).send(err);
                                });
                        }).catch(function(err) {
                            res.status(400).send(err);
                        });
                    })
                    .catch(function(err) {
                        res.status(400).send(err);
                    });
                });
            };

            /**
             * Initialise the /cat routes
             *
             * @param args
             * @returns {Promise}
             */
            catObject.initialise = function(args) {
                privates.initPromise = new Promise(function(resolve, reject) {
                    if (args.app === undefined) {
                        reject();
                    } else {
                        privates.app = args.app;

                        privates.attachRoute();
                        resolve();
                    }
                });

                return privates.initPromise;
            };

            return catObject;
        };

    // Ensure we have a singleton
    if (catSingleton === undefined) {
        catSingleton = cat();
    }
    return catSingleton;
}());
