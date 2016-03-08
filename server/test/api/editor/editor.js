'use strict';
/*eslint-env node, mocha */
/*jslint node: true */
// Chai
var chai = require("chai");

// Chai libraries
var chaiAsPromised = require("chai-as-promised"),
    chaiHttp = require('chai-http'),
    fs = require('fs'),
    path = require('path');

// Get utilities
var server = require('../../../lib/server.js'),
    settings = require('../api-settings.js');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
chai.should();

describe("POST /cat", function() {
    var testFilePath = path.join(__dirname, '../../../lib/examples/test/methods.json'),
        url = '/cat?url=LOCAL:test-methods';

    before(function(done) {
        // Write a blank catalogue to use for next tests
        fs.writeFile(testFilePath, JSON.stringify({
            "catalogue-metadata": [
                {
                    "val": "application/vnd.hypercat.catalogue+json",
                    "rel": "urn:X-hypercat:rels:isContentType"
                },
                {
                    "val": "Empty Catalogue",
                    "rel": "urn:X-hypercat:rels:hasDescription:en"
                }
            ],
            "items": []
        }, null, "\t"), function() {
            server.start(true).then(function() {
                done();
            });
        });
    });

    after(function(done) {
        server.stop().then(function() {
            done();
        });
    });

    it("should return a status of 200", function() {
        return chai.request(settings.getBaseURL())
            .post(url)
            .send({
                "item-metadata": [
                    {
                        "val": "",
                        "rel": "urn:X-hypercat:rels:hasDescription:en"
                    },
                    {
                        "val": "oneval",
                        "rel": "onerel"
                    }
                ],
                "href": "/test-href"
            })
            .then(function(res) {
                res.should.have.status(200);
            });
    });

    it("should return an 400 error with an invalid JSON format", function() {
        return chai.request(settings.getBaseURL())
            .post(url)
            .send('{"rel"":"some""}')
            .then(function(res) {
                res.should.have.status(400);
            });
    });

    it("should return an 400 error with invalid Hypercat format", function() {
        return chai.request(settings.getBaseURL())
            .post(url)
            .send({
                "i-etadata": [
                    {
                        "val": "oneval",
                        "rel": "onerel"
                    }
                ],
                "href": "/test"
            })
            .then(function(res) {
                res.should.have.status(400);
            });
    });

    it("should return an 400 error with a duplicate href", function() {
        return chai.request(settings.getBaseURL())
            .post(url)
            .send({
                "item-metadata": [
                    {
                        "val": "",
                        "rel": "urn:X-hypercat:rels:hasDescription:en"
                    },
                    {
                        "val": "oneval",
                        "rel": "onerel"
                    }
                ],
                "href": "/test-href"
            })
            .then(function(res) {
                res.should.have.status(400);
            });
    });

    it("should now have a catalogue with one item", function() {
        return chai.request(settings.getBaseURL()).get(url)
            .then(function(res) {
                res.body.items.should.have.length(1);
            });
    });

    it("should contain an the item with an href of '/test-href'", function() {
        return chai.request(settings.getBaseURL()).get(url)
            .then(function(res) {
                res.body.should.have.deep
                    .property('items[0].href')
                    .that.equals('/test-href');
            });
    });
});

describe("PUT /cat", function() {
    var url = '/cat?url=LOCAL:test-methods';

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

    it("should return a status of 200", function() {
        return chai.request(settings.getBaseURL())
            .put(url + '&href=%2Ftest-href')
            .send({
                "item-metadata": [
                    {
                        "val": "",
                        "rel": "urn:X-hypercat:rels:hasDescription:en"
                    },
                    {
                        "val": "twoval",
                        "rel": "tworel"
                    }
                ],
                "href": "/test-href-2"
            })
            .then(function(res) {
                res.should.have.status(200);
            });
    });

    it("should still return a catalogue with one item", function() {
        return chai.request(settings.getBaseURL()).get(url)
            .then(function(res) {
                res.body.items.should.have.length(1);
            });
    });

    it("should contain an the item with an href of '/test-href-2'", function() {
        return chai.request(settings.getBaseURL()).get(url)
            .then(function(res) {
                res.body.should.have.deep
                    .property('items[0].href')
                    .that.equals('/test-href-2');
            });
    });
});

describe("DELETE /cat", function() {
    var url = '/cat?url=LOCAL:test-methods';

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

    it("should return a status of 200", function() {
        return chai.request(settings.getBaseURL())
            .del(url + '&href=%2Ftest-href-2')
            .then(function(res) {
                res.should.have.status(200);
            });
    });

    it("should now return an empty catalogue", function() {
        return chai.request(settings.getBaseURL()).get(url)
            .then(function(res) {
                res.body.items.should.have.length(0);
            });
    });

    it("should still return a document that has 'items' as an array, but empty", function() {
        return chai.request(settings.getBaseURL()).get(url)
            .then(function(res) {
                res.body.items.should.be.an('array');
                /*eslint-disable */
                res.body.items.should.be.empty;
                /*eslint-enable */
            });
    });
});
