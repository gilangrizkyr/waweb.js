'use strict';

const BaseAuthStrategy = require('./BaseAuthStrategy');

/**
 * RemoteAuth strategy - uses a remote store implementation to save/extract sessions
 */
class RemoteAuth extends BaseAuthStrategy {
    constructor(options = {}) {
        super();
        this.store = options.store;
        this.clientId = options.clientId || 'client';
        this.backupSyncIntervalMs = options.backupSyncIntervalMs || 60000;
    }
}

module.exports = RemoteAuth;
