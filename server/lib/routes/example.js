'use strict';
/*jslint node: true */

var tlo = require('../core-utils/tlo'),
    fs = require('fs'),
    path = require('path');

module.exports = (function() {
    var exampleSingleton,

        example = function() {
            var exampleObject = tlo({}),
                privates = {};

            privates.attachRoute = function() {
                var app = privates.app;

                app.get('/test', function(req, res) {
                    res.status(200).send({
                        "item-metadata":[
                            {
                                "rel":"urn:X-hypercat:rels:isContentType",
                                "val":"application/vnd.hypercat.catalogue+json"
                            },
                            {
                                "rel":"urn:X-hypercat:rels:hasDescription:en",
                                "val":"all sensors in deployment"
                            }
                        ],
                        "items":[
                            {
                                "href":"/examples/sensors/powermonitor.json",
                                "i-object-metadata":[
                                    {
                                        "rel":"urn:X-hypercat:rels:isContentType",
                                        "val":"application/vnd.hypercat.catalogue+json"
                                    },
                                    {
                                        "rel":"urn:X-hypercat:rels:hasDescription:en",
                                        "val":"power monitor"
                                    }
                                ]
                            },
                            {
                                "href":"/examples/sensors/temperaturemonitor.json",
                                "i-object-metadata":[
                                    {
                                        "rel":"urn:X-hypercat:rels:isContentType",
                                        "val":"application/vnd.hypercat.catalogue+json"
                                    },
                                    {
                                        "rel":"urn:X-hypercat:rels:hasDescription:en",
                                        "val":"temperature monitor"
                                    }
                                ]
                            }
                        ]
                    });
                });

                app.get('/examples/:exampleName', function(req, res) {
                    var exampleName = req.params.exampleName,
                        examplePath = path.join(__dirname, '../examples/', exampleName);

                    if (example !== undefined) {
                        fs.readFile(examplePath + '.json', function(err, data) {
                            if (!err) {
                                res.contentType('application/json').status(200).send(data);
                            } else {
                                res.status(400).send('Error fetching example');
                            }
                        });
                    } else {
                        res.status(404).send();
                    }
                });
            };

            exampleObject.initialise = function(args) {
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

            return exampleObject;
        };

    if (exampleSingleton === undefined) {
        exampleSingleton = example();
    }
    return exampleSingleton;
}());
