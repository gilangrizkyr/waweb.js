'use strict';

const Base = require('./Base');

/**
 * Represents a WhatsApp Business Label
 */
class Label extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        this.id = data.id;
        this.name = data.name;
        this.color = data.color;
        this.hexColor = data.hexColor;
        return super._patch(data);
    }

    /**
     * Get all chats assigned to this label
     * @returns {Promise<Array<Chat>>}
     */
    async getChats() {
        return this.client.getChatsByLabelId(this.id);
    }
}

module.exports = Label;
