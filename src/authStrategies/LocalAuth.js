'use strict';

const path = require('path');
const fs = require('fs');
const BaseAuthStrategy = require('./BaseAuthStrategy');

/**
 * LocalAuth strategy - persists session data in a local folder
 */
class LocalAuth extends BaseAuthStrategy {
    constructor(options = {}) {
        super();
        this.clientId = options.clientId;
        this.dataPath = path.resolve(options.dataPath || './.wwebjs_auth');
    }

    async beforeBrowserInit() {
        const sessionDirName = this.clientId ? `session-${this.clientId}` : 'session';
        this.userDataDir = path.join(this.dataPath, sessionDirName);

        if (!fs.existsSync(this.userDataDir)) {
            fs.mkdirSync(this.userDataDir, { recursive: true });
        }

        this.client.options.puppeteer = {
            ...this.client.options.puppeteer,
            userDataDir: this.userDataDir
        };
    }
}

module.exports = LocalAuth;
