'use strict';

const Chat = require('./Chat');

/**
 * Represents a Group Chat on WhatsApp
 */
class GroupChat extends Chat {
    _patch(data) {
        this.owner = data.owner;
        this.createdAt = data.createdAt ? new Date(data.createdAt * 1000) : null;
        this.description = data.desc;
        this.participants = data.participants || [];
        return super._patch(data);
    }

    /**
     * Changes the group subject/title
     * @param {string} subject
     * @returns {Promise<boolean>}
     */
    async setSubject(subject) {
        return this.client.pupPage.evaluate(async (chatId, subject) => {
            const chat = window.Store.Chat.get(chatId);
            return await window.Store.GroupUtils.setGroupSubject(chat, subject);
        }, this.id._serialized, subject);
    }

    /**
     * Changes the group description
     * @param {string} description
     * @returns {Promise<boolean>}
     */
    async setDescription(description) {
        return this.client.pupPage.evaluate(async (chatId, description) => {
            const chat = window.Store.Chat.get(chatId);
            return await window.Store.GroupUtils.setGroupDescription(chat, description);
        }, this.id._serialized, description);
    }

    /**
     * Adds participants to the group
     * @param {Array<string>} participantIds
     * @returns {Promise<Object>}
     */
    async addParticipants(participantIds) {
        return this.client.pupPage.evaluate(async (chatId, participantIds) => {
            const chat = window.Store.Chat.get(chatId);
            const participants = participantIds.map(p => window.Store.Contact.get(p));
            return await window.Store.GroupParticipants.addParticipants(chat, participants);
        }, this.id._serialized, participantIds);
    }

    /**
     * Removes participants from the group
     * @param {Array<string>} participantIds
     * @returns {Promise<Object>}
     */
    async removeParticipants(participantIds) {
        return this.client.pupPage.evaluate(async (chatId, participantIds) => {
            const chat = window.Store.Chat.get(chatId);
            const participants = participantIds.map(p => window.Store.Contact.get(p));
            return await window.Store.GroupParticipants.removeParticipants(chat, participants);
        }, this.id._serialized, participantIds);
    }

    /**
     * Promotes participants to admin
     * @param {Array<string>} participantIds
     * @returns {Promise<Object>}
     */
    async promoteParticipants(participantIds) {
        return this.client.pupPage.evaluate(async (chatId, participantIds) => {
            const chat = window.Store.Chat.get(chatId);
            const participants = participantIds.map(p => window.Store.Contact.get(p));
            return await window.Store.GroupParticipants.promoteParticipants(chat, participants);
        }, this.id._serialized, participantIds);
    }

    /**
     * Demotes admin participants to regular members
     * @param {Array<string>} participantIds
     * @returns {Promise<Object>}
     */
    async demoteParticipants(participantIds) {
        return this.client.pupPage.evaluate(async (chatId, participantIds) => {
            const chat = window.Store.Chat.get(chatId);
            const participants = participantIds.map(p => window.Store.Contact.get(p));
            return await window.Store.GroupParticipants.demoteParticipants(chat, participants);
        }, this.id._serialized, participantIds);
    }

    /**
     * Gets the invite code for the group
     * @returns {Promise<string>}
     */
    async getInviteCode() {
        return this.client.pupPage.evaluate(async (chatId) => {
            const chat = window.Store.Chat.get(chatId);
            return await window.Store.GroupInvite.queryGroupInviteCode(chat);
        }, this.id._serialized);
    }

    /**
     * Revokes the current invite code and generates a new one
     * @returns {Promise<string>}
     */
    async revokeInviteCode() {
        return this.client.pupPage.evaluate(async (chatId) => {
            const chat = window.Store.Chat.get(chatId);
            return await window.Store.GroupInvite.revokeGroupInviteCode(chat);
        }, this.id._serialized);
    }
}

module.exports = GroupChat;
