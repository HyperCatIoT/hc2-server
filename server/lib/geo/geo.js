'use strict';
/*jslint node: true */

var tlo = require('../core-utils/tlo');

module.exports = (function() {
    var geoSingleton,

        geo = function () {
            var geoObject = tlo({}),
                // MIN_LATITUDE = -90,
                // MAX_LATITUDE = 90,
                MIN_LONGITUDE = -180,
                MAX_LONGITUDE = 180;

            /**
             * A method to check whether a given point ({lat: float, long: float})
             * fits inside a number of optional minimum/maximum boundaries
             * specified as floats
             *
             * returns @boolean
             */
            geoObject.isPointWithinBounds = function(args) {
                var minLat = args.minLat || false,
                    maxLat = args.maxLat || false,
                    minLong = args.minLong || false,
                    maxLong = args.maxLong || false,
                    point = args.point,
                    useAntimeridian = false,
                    found = false;

                // Check whether we are crossing the antimeridian
                // otherwise known as the 180th meridian
                if ((minLong && maxLong) && (minLong > maxLong)) {
                    useAntimeridian = true;
                }

                // Check latitude values
                if (minLat || maxLat) {
                    // Check both
                    if (minLat && maxLat &&
                        (minLat < point.lat) &&
                        (maxLat > point.lat)) {
                            found = true;
                    } else if (minLat && !maxLat &&
                        (minLat < point.lat)) { // min only
                            found = true;
                    } else if (!minLat && maxLat &&
                        (maxLat > point.lat)) { // max only
                            found = true;
                    } else {
                        found = false;
                    }
                }

                // Check the longitudes now
                if (minLong || maxLong) {
                    if (!useAntimeridian) {
                        // Check both values normally
                        if (minLong && maxLong &&
                            (minLong < point.long) &&
                            (maxLong > point.long)) {
                                found = true;
                        } else if (minLong && !maxLong &&
                            (minLong < point.long)) { // min only
                                found = true;
                        } else if (!minLong && maxLong &&
                            (maxLong > point.long)) { // max only
                                found = true;
                        } else {
                            found = false;
                        }
                    } else {
                        // Check values across the antimeridian
                        // We also know that both min and max are specified
                        if ((point.long > minLong && point.long < MAX_LONGITUDE) ||
                            (point.long < maxLong && point.long > MIN_LONGITUDE)) {
                                found = true;
                        } else {
                            found = false;
                        }
                    }
                }

                // Return the boolean
                return found;
            };

            return geoObject;
        };
    // Ensure we have a singleton
    if (geoSingleton === undefined) {
        geoSingleton = geo();
    }
    return geoSingleton;
}());
