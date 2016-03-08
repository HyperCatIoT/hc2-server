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
    settings = require('../api-settings.js'),
    hypercat = require('../../../lib/hypercat/hypercat.js');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
chai.should();

describe("GET /cat", function() {
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

    it("should return a status code of 200", function(done) {
        return chai.request(settings.getBaseURL()).get('/cat')
            .then(function(res) {
                res.should.have.status(200);
                done();
            });
    });

    it("should return a JSON object", function(done) {
        return chai.request(settings.getBaseURL()).get('/cat')
            .then(function(res) {
                /*eslint-disable */
                res.should.be.json;
                /*eslint-enable */
                done();
            });
    });

    it("should return a valid hypercat document", function() {
        return chai.request(settings.getBaseURL()).get('/cat')
            .then(function(res) {
                return hypercat.checkValid(res.body).should.be.fulfilled;
            });
    });
});

describe("GET /cat with external URL", function() {
    var externalUrl = '/cat?url=' + encodeURIComponent('http://localhost:8080/test'),
        malformedUrl = '/cat?url=badurl/123',
        fourOhFour = '/cat?url=' + encodeURIComponent('http://www.google.com/cat/test'),
        nonJson = '/cat?url=' + encodeURIComponent('http://www.google.com/'),
        nonHypercat = '/cat?url=' + encodeURIComponent('http://date.jsontest.com');

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

    it("should return a status code of 200", function(done) {
        return chai.request(settings.getBaseURL()).get(externalUrl)
            .then(function(res) {
                res.should.have.status(200);
                done();
            }).catch(function() {
                done(new Error("Error getting URL"));
            });
    });

    it("should return a status 400 error if the URL is malformed", function() {
        return chai.request(settings.getBaseURL()).get(malformedUrl)
            .then(function(res) {
                res.should.have.status(400);
            });
    });

    it("should return a status 400 error if the URL points to a 404 error", function() {
        return chai.request(settings.getBaseURL()).get(fourOhFour)
            .then(function(res) {
                res.should.have.status(400);
            });
    });

    it("should return a status 400 error if the URL returns a non-JSON document", function() {
        return chai.request(settings.getBaseURL()).get(nonJson)
            .then(function(res) {
                res.should.have.status(400);
            });
    });

    it("should return a status 400 error if the URL retuns a non-Hypercat document", function() {
        return chai.request(settings.getBaseURL()).get(nonHypercat)
            .then(function(res) {
                res.should.have.status(400);
            });
    });
});
