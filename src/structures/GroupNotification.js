'use strict';

const Base = require('./Base');

/**
 * Represents a Group Notification Event
 */
class GroupNotification extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        this.id = data.id;
        this.body = data.body;
        this.type = data.subtype;
        this.timestamp = data.t;
        this.chatId = data.id.remote;
        this.author = data.author;
        this.recipientIds = data.recipients || [];
        return super._patch(data);
    }

    /**
     * Gets the chat where this notification occurred
     * @returns {Promise<Chat>}
     */
    async getChat() {
        return this.client.getChatById(this.chatId);
    }

    /**
     * Gets the contact of the user who performed the action
     * @returns {Promise<Contact>}
     */
    async getContact() {
        return this.client.getContactById(this.author);
    }
}

module.exports = GroupNotification;
