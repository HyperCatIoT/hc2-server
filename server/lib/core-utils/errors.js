'use strict';
/*jslint node: true */

/**
 * @module errors
 *
 * @returns {errors} Returns the errors constructor.
 */

module.exports = (function () {
    /**
     * @alias errors
     *
     * @classdesc
     * Allows the creation of custom error types for each module in the system.
     *
     * @constructor
     */
    var errors = {};

    errors.moduleRegistry = [
        { name: "persistence/CriteriaModule", moduleID: 0 },
        { name: "persistence/FilterModule", moduleID: 1 },
        { name: "persistence/OperationsModule}", moduleID: 2}
        // And so on.
    ];

    /**
     * Argument list for creating a new error type.
     *
     * @typedef {Object} errors~arguments
     * @property {String} name - Name of the new error type.
     * @property {String} message - Error message to display.
     * @property {Number} module - Allocated module number.
     * @property {Number} errorCode - Unique module based code for error.
     */

    /**
     * Creates a new error type.
     *
     * @instance
     *
     * @param {errors~arguments} args - Arguments for creating a new error
     *      instance.
     *
     * @returns The new error object.
     */
    errors.error = function (args) {
        var self = Object.create(Error.prototype);
        self.name = args.name;
        self.message = args.message;

        return self;
    };

    errors.namespaceError = function (string) {
        return errors.error({ name: "NamespaceError", message: string });
    };

    errors.databaseError = function (string) {
        return errors.error({ name: "DatabaseError", message: string });
    };

    errors.criteriaError = function (string) {
        return errors.error({ name: "CriteriaError", message: string });
    };

    errors.operationError = function (string) {
        return errors.error({ name: "OperationError", message: string });
    };

    return errors;
}());
