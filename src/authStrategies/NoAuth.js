'use strict';

const BaseAuthStrategy = require('./BaseAuthStrategy');

/**
 * NoAuth strategy - ephemeral session without persistence
 */
class NoAuth extends BaseAuthStrategy {
    constructor() {
        super();
    }
}

module.exports = NoAuth;
