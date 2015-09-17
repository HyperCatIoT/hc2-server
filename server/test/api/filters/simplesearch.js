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

describe("Filter - SimpleSearch", function() {
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
            .get(catUrl + '&rel=reference')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(3);
            });
    });

    it("val only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&val=something')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("href only", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&href=%2Fsomething-else')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("rel and val", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&rel=reference&val=something')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("rel and href", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&rel=reference&href=%2Fsomething-else')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("val and href", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&val=something&href=testing')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(0);
            });
    });

    it("works with escaped characters", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&rel=escaped%20rel&val=escaped%20val')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });
});
