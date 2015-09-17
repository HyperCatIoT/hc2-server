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

describe("Filter - GeographicSearch", function() {
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

    it("should work with geobound-minlat only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-minlat=50.1242')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("should work with geobound-maxlat only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-maxlat=50.1242')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(5);
            });
    });

    it("should work with geobound-minlat and geobound-maxlat", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-minlat=40.001&geobound-maxlat=50.1242')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(2);
            });
    });

    it("should work with geobound-minlong only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-minlong=70.1209')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(4);
            });
    });

    it("should work with geobound-maxlong only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-maxlong=80.3049')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(4);
            });
    });

    it("should work with geobound-minlong and geobound-maxlong", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-minlong=70.1209&geobound-maxlong=80.3049')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(2);
            });
    });

    it("should work with all parameters together", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-minlat=40.001&geobound-maxlat=50.1242' +
                '&geobound-minlong=70.1209&geobound-maxlong=75.3049')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("should work if the rect crosses the 180th meridian", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&geobound-minlat=-31.95&geobound-maxlat=-3.513' +
                '&geobound-minlong=167.343&geobound-maxlong=-146.9531')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });
});
