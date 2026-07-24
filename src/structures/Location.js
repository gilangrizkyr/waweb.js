'use strict';

/**
 * Location structure
 */
class Location {
    /**
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} [description]
     */
    constructor(latitude, longitude, description) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
    }
}

module.exports = Location;
