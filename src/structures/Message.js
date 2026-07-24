'use strict';

const Base = require('./Base');
const MessageMedia = require('./MessageMedia');

/**
 * Represents a Message on WhatsApp
 */
class Message extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        this.id = data.id;
        this.ack = data.ack;
        this.hasMedia = Boolean(data.mediaKey || data.directPath || data.deprecatedMms3Url);
        this.body = data.body || '';
        this.type = data.type;
        this.timestamp = data.t;
        this.from = data.from;
        this.to = data.to;
        this.author = data.author;
        this.deviceType = data.deviceType;
        this.isForwarded = data.isForwarded || false;
        this.forwardingScore = data.forwardingScore || 0;
        this.isStatus = data.isStatus || false;
        this.isStarred = data.star || false;
        this.broadcast = data.broadcast || false;
        this.fromMe = data.id ? data.id.fromMe : false;
        this.hasQuotedMsg = Boolean(data.quotedMsg);
        this.quotedMsg = data.quotedMsg;
        this.duration = data.duration || '';
        this.location = data.location;
        this.vCards = data.vCards || [];
        this.mentionedIds = data.mentionedJidList || [];

        if (data.pollOptions) {
            this.pollName = data.pollName;
            this.pollOptions = data.pollOptions;
        }

        return super._patch(data);
    }

    /**
     * Reply to this message
     * @param {string|MessageMedia|Location|Poll} content
     * @param {Object} [options]
     * @returns {Promise<Message>}
     */
    async reply(content, options = {}) {
        options.quotedMessageId = this.id._serialized;
        const chatId = this.fromMe ? this.to : this.from;
        return this.client.sendMessage(chatId, content, options);
    }

    /**
     * React to this message with an emoji
     * @param {string} reaction Emoji string
     */
    async react(reaction) {
        return this.client.pupPage.evaluate(async (msgId, reaction) => {
            await window.WWebJS.sendReaction(msgId, reaction);
        }, this.id._serialized, reaction);
    }

    /**
     * Edit the text of this message (if supported)
     * @param {string} newBody
     * @returns {Promise<Message>}
     */
    async edit(newBody) {
        return this.client.pupPage.evaluate(async (msgId, newBody) => {
            const msg = window.Store.Msg.get(msgId);
            if (!msg) return false;
            return await window.Store.Cmd.editMsg(msg, newBody);
        }, this.id._serialized, newBody);
    }

    /**
     * Deletes the message
     * @param {boolean} [everyone=false] If true, deletes for everyone
     */
    async delete(everyone = false) {
        return this.client.pupPage.evaluate(async (msgId, everyone) => {
            const msg = window.Store.Msg.get(msgId);
            if (everyone) {
                await window.Store.Cmd.sendRevokeMsgs(msg.chat, [msg], { clearMedia: true });
            } else {
                await window.Store.Cmd.sendDeleteMsgs(msg.chat, [msg], true);
            }
        }, this.id._serialized, everyone);
    }

    /**
     * Downloads media attached to this message
     * @returns {Promise<MessageMedia>}
     */
    async downloadMedia() {
        if (!this.hasMedia) return null;
        
        const result = await this.client.pupPage.evaluate(async (msgId) => {
            const msg = window.Store.Msg.get(msgId);
            if (!msg) return null;
            const data = await window.WWebJS.downloadBuffer(msg.directPath);
            return {
                mimetype: msg.mimetype,
                data: data,
                filename: msg.filename
            };
        }, this.id._serialized);

        if (!result) return null;
        return new MessageMedia(result.mimetype, result.data, result.filename);
    }

    /**
     * Forwards this message to another chat
     * @param {string|Chat} chat
     */
    async forward(chat) {
        const chatId = typeof chat === 'string' ? chat : chat.id._serialized;
        return this.client.pupPage.evaluate(async (msgId, chatId) => {
            const msg = window.Store.Msg.get(msgId);
            const chat = window.Store.Chat.get(chatId);
            await window.Store.Cmd.forwardMessagesToChat([msg], chat);
        }, this.id._serialized, chatId);
    }

    /**
     * Gets the quoted message if present
     * @returns {Promise<Message>}
     */
    async getQuotedMessage() {
        if (!this.hasQuotedMsg) return null;
        return new Message(this.client, this.quotedMsg);
    }

    /**
     * Stars this message
     */
    async star() {
        return this.client.pupPage.evaluate(async (msgId) => {
            const msg = window.Store.Msg.get(msgId);
            await window.Store.Cmd.sendStarMsgs(msg.chat, [msg], true);
        }, this.id._serialized);
    }

    /**
     * Unstars this message
     */
    async unstar() {
        return this.client.pupPage.evaluate(async (msgId) => {
            const msg = window.Store.Msg.get(msgId);
            await window.Store.Cmd.sendStarMsgs(msg.chat, [msg], false);
        }, this.id._serialized);
    }
}

module.exports = Message;
