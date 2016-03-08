'use strict';
/*eslint-env node, mocha */
/*jslint node: true */
// Chai
var chai = require("chai");

// Chai Promises
var chaiAsPromised = require("chai-as-promised");

// Get utilities.
var hypercat = require('../../../lib/hypercat/hypercat.js');

chai.use(chaiAsPromised);
chai.should();

describe('Hypercat Validity', function() {
    it("should accept a valid hypercat document", function() {
        return hypercat.checkValid({
            "catalogue-metadata":[
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
                    "item-metadata":[
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
                    "item-metadata":[
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
        }).should.be.fulfilled;
    });

    it("should reject an empty document", function() {
        return hypercat.checkValid({}).should.be.rejected;
    });

    it("should reject a document with no metadata", function() {
        return hypercat.checkValid({
            "items": [
                {
                    "href":"/examples/sensors/temperaturemonitor.json",
                    "item-metadata":[
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
        }).should.be.rejected;
    });

    it("should reject a document with no items", function() {
        return hypercat.checkValid({
            "catalogue-metadata":[
                {
                    "rel":"urn:X-hypercat:rels:isContentType",
                    "val":"application/vnd.hypercat.catalogue+json"
                },
                {
                    "rel":"urn:X-hypercat:rels:hasDescription:en",
                    "val":"all sensors in deployment"
                }
            ]
        }).should.be.rejected;
    });

    it("should accept a valid catalog document", function() {
        return hypercat.checkIfCatalog({
            "catalogue-metadata":[
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
                    "item-metadata":[
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
                    "item-metadata":[
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
        }).should.be.fulfilled;
    });

    it("should decline a catalog without the correct metadata", function() {
        return hypercat.checkIfCatalog({
            "catalogue-metadata":[
                {
                    "rel":"urn:X-hypercat:rels:isContentType",
                    "val":"application/vnd.hypercat.item+json"
                },
                {
                    "rel":"urn:X-hypercat:rels:hasDescription:en",
                    "val":"all sensors in deployment"
                }
            ],
            "items":[
                {
                    "href":"/examples/sensors/powermonitor.json",
                    "item-metadata":[
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
                    "item-metadata":[
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
        }).should.be.rejected;
    });

    it("should decline a v1 hypercat document (using tsbiot)", function() {
        return hypercat.checkIfCatalog({
            "catalogue-metadata":[
                {
                    "rel":"urn:X-tsbiot:rels:isContentType",
                    "val":"application/vnd.tsbiot.catalogue+json"
                },
                {
                    "rel":"urn:X-tsbiot:rels:hasDescription:en",
                    "val":"all sensors in deployment"
                }
            ],
            "items":[
                {
                    "href":"/examples/sensors/powermonitor.json",
                    "item-metadata":[
                        {
                            "rel":"urn:X-tsbiot:rels:isContentType",
                            "val":"application/vnd.tsbiot.catalogue+json"
                        },
                        {
                            "rel":"urn:X-tsbiot:rels:hasDescription:en",
                            "val":"power monitor"
                        }
                    ]
                },
                {
                    "href":"/examples/sensors/temperaturemonitor.json",
                    "item-metadata":[
                        {
                            "rel":"urn:X-tsbiot:rels:isContentType",
                            "val":"application/vnd.tsbiot.catalogue+json"
                        },
                        {
                            "rel":"urn:X-tsbiot:rels:hasDescription:en",
                            "val":"temperature monitor"
                        }
                    ]
                }
            ]
        }).should.be.rejected;
    });
});
