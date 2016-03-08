'use strict';
/*eslint-env node, mocha */
/*jslint node: true */
// Chai
var chai = require("chai");

// Chai libraries
var chaiAsPromised = require("chai-as-promised"),
    chaiHttp = require('chai-http');

// Get utilities
var server = require('../../../lib/server.js'),
    settings = require('../api-settings.js');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
chai.should();

describe("Filter - MultiSearch", function() {
    var catUrl = '/cat?url=LOCAL:test-geo';

    before(function(done) {
        server.start(true).then(function() {
            done();
        });
    });

    after(function(done) {
        server.stop().then(function() {
            done();
        });
    });

    it("should return a 200 status", function() {
        return chai.request(settings.getBaseURL())
            .post(catUrl)
            .send({
                "query": "?href=/london"
            })
            .then(function(res) {
                res.should.have.status(200);
            });
    });

    it("should work with a single, basic query", function() {
        return chai.request(settings.getBaseURL())
            .post(catUrl)
            .send({
                "query": "?href=/london"
            })
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("should work with a union of two queries", function() {
        return chai.request(settings.getBaseURL())
            .post(catUrl)
            .send({
                "union": [
                    {"query": "?geobound-minlat=0.012"},
                    {"query": "?prefix-href=%2Flon"}
                ]
            })
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(5);
            });
    });

    it("should work with an intersection of two queries", function() {
        return chai.request(settings.getBaseURL())
            .post(catUrl)
            .send({
                "intersection": [
                    {"query": "?geobound-minlat=0.012"},
                    {"query": "?prefix-href=%2Flon"}
                ]
            })
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("should still work when using a union or intersection on a single object, without performing AND or OR", function() {
        return chai.request(settings.getBaseURL())
            .post(catUrl)
            .send({
                "union": {"query": "?geobound-minlat=0.012"}
            })
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(5);
            });
    });

    it("should work with a combination of both intersection and union", function() {
        return chai.request(settings.getBaseURL())
            .post(catUrl)
            .send({
                "intersection": [
                    {"query": "?prefix-href=%2Flon"},
                    {"union": [
                        {"query": "?prefix-rel=http%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo"},
                        {"query": "?geobound-minlat=49.15296965617042&geobound-maxlat=60.06484046010452&geobound-minlong=-13.7109375&geobound-maxlong=4.921875"}
                    ]}
                ]
            })
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

});
