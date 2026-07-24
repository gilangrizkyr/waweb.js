'use strict';

const Base = require('./Base');

/**
 * Represents a Contact on WhatsApp
 */
class Contact extends Base {
    constructor(client, data) {
        super(client);
        if (data) this._patch(data);
    }

    _patch(data) {
        this.id = data.id;
        this.number = data.userid || (data.id ? data.id.user : undefined);
        this.isBusiness = data.isBusiness || false;
        this.isEnterprise = data.isEnterprise || false;
        this.isGroup = data.isGroup || false;
        this.isUser = data.isUser || false;
        this.isMyContact = data.isMyContact || false;
        this.isWAContact = data.isWAContact || false;
        this.isBlocked = data.isBlocked || false;
        this.name = data.name;
        this.pushname = data.pushname;
        this.shortName = data.shortName;
        return super._patch(data);
    }

    /**
     * Gets the profile picture URL
     * @returns {Promise<string>}
     */
    async getProfilePicUrl() {
        return await this.client.getProfilePicUrl(this.id._serialized);
    }

    /**
     * Gets the Chat for this contact
     * @returns {Promise<Chat>}
     */
    async getChat() {
        return await this.client.getChatById(this.id._serialized);
    }

    /**
     * Blocks this contact
     * @returns {Promise<boolean>}
     */
    async block() {
        return await this.client.pupPage.evaluate(async (contactId) => {
            const contact = window.Store.Contact.get(contactId);
            return await window.Store.BlockContact.blockContact({ contact, report: false });
        }, this.id._serialized);
    }

    /**
     * Unblocks this contact
     * @returns {Promise<boolean>}
     */
    async unblock() {
        return await this.client.pupPage.evaluate(async (contactId) => {
            const contact = window.Store.Contact.get(contactId);
            return await window.Store.BlockContact.unblockContact({ contact });
        }, this.id._serialized);
    }

    /**
     * Gets status / about text
     * @returns {Promise<string>}
     */
    async getAbout() {
        return await this.client.pupPage.evaluate(async (contactId) => {
            const status = await window.Store.Status.getStatus(contactId);
            return status ? status.status : null;
        }, this.id._serialized);
    }
}

module.exports = Contact;
