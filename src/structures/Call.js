'use strict';

const Base = require('./Base');

/**
 * Represents a Call on WhatsApp
 */
class Call extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        this.id = data.id;
        this.from = data.from;
        this.timestamp = data.date;
        this.isVideo = data.isVideo;
        this.isGroup = data.isGroup;
        this.fromMe = data.fromMe;
        this.canHandleLocally = data.canHandleLocally;
        this.webCallId = data.webCallId;
        return super._patch(data);
    }

    /**
     * Rejects the incoming call
     */
    async reject() {
        return this.client.pupPage.evaluate(async (callId) => {
            return await window.Store.Call.rejectCall(callId);
        }, this.id);
    }
}

module.exports = Call;
