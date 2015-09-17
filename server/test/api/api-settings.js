"use strict";

module.exports = {
    getBaseURL: function() {
        return process.env.TARGET_BASEURL || 'http://localhost:8040';
    },
    isLocal: function() {
        return (process.env.TARGET_BASEURL === undefined);
    }
};
