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

describe("Filter - LexicographicSearch", function() {
    var catUrl = '/cat?url=LOCAL:test-lexicographic';

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
            .get(catUrl + '&lexrange-rel=createdDate')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(3);
            });
    });

    it("rel with minimum specified", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&lexrange-rel=createdDate&lexrange-min=2007-01-01T13:00:00Z')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(2);
            });
    });

    it("rel with maximum specified", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&lexrange-rel=createdDate&lexrange-max=2007-01-01T13:00:00Z')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });

    it("rel with minimum and maximum specified", function() {
        return chai.request(settings.getBaseURL())
            .get(catUrl + '&lexrange-rel=createdDate&lexrange-min=2007-01-01T13:00:00Z&lexrange-max=2015-01-01T13:00:00Z')
            .then(function(res) {
                res.body.should.have.property('items').which.has.length(1);
            });
    });
});
