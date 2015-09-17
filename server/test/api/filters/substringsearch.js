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

describe("Filter - SubstringSearch", function() {
    var catUrl = '/cat?url=LOCAL:test-simple';

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

    it("rel only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-rel=ref')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(3);
            });
    });

    it("val only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-val=some')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(2);
            });
    });

    it("href only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-href=/some')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(2);
            });
    });

    it("rel and val", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-rel=ref&substring-val=some')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(2);
            });
    });

    it("rel and href", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-rel=ref&substring-href=%2F')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(3);
            });
    });

    it("val and href", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-val=some&substring-href=testing')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(0);
            });
    });

    it("works with escaped characters", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&substring-rel=escaped%20rel&substring-val=escaped%20val')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });
});
