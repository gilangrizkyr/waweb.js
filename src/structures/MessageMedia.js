'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

/**
 * Media wrapper for sending & receiving files
 */
class MessageMedia {
    /**
     * @param {string} mimetype
     * @param {string} data Base64 data
     * @param {string} [filename]
     * @param {number} [filesize]
     */
    constructor(mimetype, data, filename, filesize) {
        this.mimetype = mimetype;
        this.data = data;
        this.filename = filename;
        this.filesize = filesize;
    }

    /**
     * Creates a MessageMedia instance from a local file path
     * @param {string} filePath
     * @returns {MessageMedia}
     */
    static fromFilePath(filePath) {
        const b64data = fs.readFileSync(filePath, { encoding: 'base64' });
        const mimetype = mime.lookup(filePath) || 'application/octet-stream';
        const filename = path.basename(filePath);
        const filesize = fs.statSync(filePath).size;

        return new MessageMedia(mimetype, b64data, filename, filesize);
    }
}

module.exports = MessageMedia;
