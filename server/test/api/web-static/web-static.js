'use strict';
/*eslint-env node, mocha */
/*jslint node: true */
// Chai
var chai = require("chai");
var expect = chai.expect;

var server = require('../../../lib/server.js');

// Chai Promises
var chaiAsPromised = require("chai-as-promised");

// Chai http
var chaiHttp = require('chai-http');

var settings = require('../api-settings.js');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
chai.should();

describe('Static web site smoke tests', function(){
    before(function (done) {
        server.start(true).then(function () {
            done();
        });
    });

    after(function (done) {
        server.stop().then(function () {
            done();
        });
    });

    it("index should load", function () {
        return chai.request(settings.getBaseURL()).get('/')
        .then(function (res) {
            expect(res).to.have.status(200);
        })
        .catch(function (err) {
            throw err;
        });
    });

    it("grunt should have created lib.js", function () {
        return chai.request(settings.getBaseURL()).get('/js/min/lib.min.js')
            .then(function (res) {
                expect(res).to.have.status(200);
            })
            .catch(function (err) {
                throw err;
            });
    });

    it("grunt should have created main.css", function () {
        return chai.request(settings.getBaseURL()).get('/css/main.css')
            .then(function (res) {
                expect(res).to.have.status(200);
            })
            .catch(function (err) {
                throw err;
            });
    });
});


