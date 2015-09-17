'use strict';
/*jslint node: true */
/**
 * Top-Level Object.
 *
 * @module tlo
 *
 * @returns {tlo} Returns the Top-Level Object constructor.
 */
module.exports = (function () {
    /**
     * The Top-Level Object constructor that should be passed through all
     * object construction.
     *
     * @typedef {Object} tlo~TloConstructor
     *
     * @property {Object} args - An object containing all of the arguments
     *  required by the constructor.
     * @property {Object} shared - A shared object that should be used to
     *  share data between all the classes in the hierarchy. The bottom level
     *  constructor should set this to be an empty object before calling its
     *  parent object constructor ('{}').
     */

    /**
     * @alias tlo
     *
     * @classdesc
     * The Top-Level Object is the parent of all objects within the system.
     * It includes functionality to allow inheritance patterns to work
     * correctly.
     *
     * @constructor
     *
     * @param {tlo~TloConstructor} constructor - Relevant constructor from the
     *  child.
     *
     * @returns {Object} - The Top-Level Object to form as a base parent for
     *  the hierarchy.
     */
    var tloConstructor = function (constructor) {
        /** @lends tlo */
        var shared = constructor.shared || {},
            tlo = {};

        // We don't have a parent, we're the top of the hierarchy.
        // Check to see if we're meant to be an event.
        if (constructor.isEvent) {
            tlo = Object.create(require('events').EventEmitter.prototype);
        }

        /**
         * Allows a child object to retrieve all parent 'super' methods.
         *
         * @param {Array<string>} methodNames An array of the method names
         *  from the parent hierarchy to retrieve.
         *
         * @returns {object} An object containing all of the parents methods.
         */
        shared.getParentMethods = function (methodNames) {
            var parent = {};

            methodNames.forEach(function (name) {
                parent[name] = tlo[name];
            });

            return parent;
        };

        return tlo;
    };

    return tloConstructor;
}());
