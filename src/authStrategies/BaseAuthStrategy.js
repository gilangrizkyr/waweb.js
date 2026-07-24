'use strict';

/**
 * Base class for authentication strategies
 */
class BaseAuthStrategy {
    constructor() {}
    
    setup(client) {
        this.client = client;
    }
    
    async beforeBrowserInit() {}
    async afterBrowserInit() {}
    async onAuthenticationNeeded() {
        return { failed: false, restart: false, cause: null };
    }
    async getAuthEventPayload() {}
    async logout() {}
    async destroy() {}
}

module.exports = BaseAuthStrategy;
