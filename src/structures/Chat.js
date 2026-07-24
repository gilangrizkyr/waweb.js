'use strict';

const Base = require('./Base');

/**
 * Represents a Chat on WhatsApp
 */
class Chat extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        this.id = data.id;
        this.name = data.name;
        this.isGroup = data.isGroup || false;
        this.isReadOnly = data.isReadOnly || false;
        this.unreadCount = data.unreadCount || 0;
        this.timestamp = data.timestamp;
        this.archived = data.archive || false;
        this.pinned = data.pin || false;
        this.isMuted = data.isMuted || false;
        this.muteExpiration = data.muteExpiration || 0;
        return super._patch(data);
    }

    /**
     * Send a message to this chat
     * @param {string|MessageMedia|Location|Poll} content
     * @param {Object} [options]
     * @returns {Promise<Message>}
     */
    async sendMessage(content, options) {
        return this.client.sendMessage(this.id._serialized, content, options);
    }

    /**
     * Mark this chat as unread
     */
    async markUnread() {
        return this.client.pupPage.evaluate(async (chatId) => {
            const chat = window.Store.Chat.get(chatId);
            await window.Store.Cmd.markChatUnread(chat);
        }, this.id._serialized);
    }

    /**
     * Archives this chat
     */
    async archive() {
        return this.client.pupPage.evaluate(async (chatId) => {
            const chat = window.Store.Chat.get(chatId);
            await window.Store.Cmd.archiveChat(chat, true);
        }, this.id._serialized);
    }

    /**
     * Unarchives this chat
     */
    async unarchive() {
        return this.client.pupPage.evaluate(async (chatId) => {
            const chat = window.Store.Chat.get(chatId);
            await window.Store.Cmd.archiveChat(chat, false);
        }, this.id._serialized);
    }

    /**
     * Mutes this chat
     * @param {Date} [unmuteDate]
     */
    async mute(unmuteDate) {
        return this.client.pupPage.evaluate(async (chatId, timestamp) => {
            const chat = window.Store.Chat.get(chatId);
            await window.Store.Cmd.muteChat(chat, timestamp || -1);
        }, this.id._serialized, unmuteDate ? Math.floor(unmuteDate.getTime() / 1000) : -1);
    }

    /**
     * Unmutes this chat
     */
    async unmute() {
        return this.client.pupPage.evaluate(async (chatId) => {
            const chat = window.Store.Chat.get(chatId);
            await window.Store.Cmd.muteChat(chat, 0);
        }, this.id._serialized);
    }

    /**
     * Send typing indicator
     */
    async sendStateTyping() {
        return this.client.pupPage.evaluate(async (chatId) => {
            await window.WWebJS.sendChatstate('typing', chatId);
        }, this.id._serialized);
    }

    /**
     * Send recording indicator
     */
    async sendStateRecording() {
        return this.client.pupPage.evaluate(async (chatId) => {
            await window.WWebJS.sendChatstate('recording', chatId);
        }, this.id._serialized);
    }

    /**
     * Clear typing/recording state
     */
    async clearState() {
        return this.client.pupPage.evaluate(async (chatId) => {
            await window.WWebJS.sendChatstate('stop', chatId);
        }, this.id._serialized);
    }
}

module.exports = Chat;
