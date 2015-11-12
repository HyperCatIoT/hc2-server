'use strict';
/*jslint node: true */

var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    path = require('path'),
    tlo = require('./core-utils/tlo.js');

module.exports = (function() {
    var serverSingleton;

    var serverHandler = function() {
        var privates = {},
            serverHandlerObject = tlo({});

        serverHandlerObject.initialise = function() {
            return serverSingleton;
        };

        serverHandlerObject.start = function(silent) {
            var app = express(),
                catRoute,
                exampleRoute;

            app.disable('x-powered-by');
            app.use(cors());
            // parse application/x-www-form-urlencoded
            app.use(bodyParser.urlencoded({ extended: false }));

            // parse application/json
            app.use(bodyParser.json());

            /*eslint-disable max-params*/
            app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
                // console.log("Error in express - need better handling:", err);
                res.status(400).send(err.toString());
            });

            // Initialise the apidocs
            app.apidoc = {};

            // Require all of the routes
            catRoute = require('./routes/cat.js');
            exampleRoute = require('./routes/example.js');

            return Promise.all([
                catRoute.initialise({
                    app: app
                }),
                exampleRoute.initialise({
                    app: app
                })
            ]).then(function() {
                // Static front-end serving
                app.use(express.static(path.join(__dirname, '/../public'),
                        { maxage: '1d' })
                );

                // Start listening
                privates.conn = app.listen(8040);
                if (!silent) {
                    console.log("HyperCat Reference daemon started on port 8040");
                }

                return Promise.resolve();
            });
        };

        serverHandlerObject.stop = function() {
            return new Promise(function (resolve) {
                privates.conn.close(function() {
                    resolve();
                });
            });
        };

        return serverHandlerObject;
    };

    // This is a singleton, and not an instance.
    // Only ever create once.
    if (serverSingleton === undefined) {
        serverSingleton = serverHandler();
    }

    return serverSingleton;
}());
