'use strict';

const EventEmitter = require('eventemitter3');
const puppeteer = require('puppeteer');
const { DefaultOptions, Events, WAState } = require('./util/Constants');
const LocalAuth = require('./authStrategies/LocalAuth');
const NoAuth = require('./authStrategies/NoAuth');
const Message = require('./structures/Message');
const Chat = require('./structures/Chat');
const GroupChat = require('./structures/GroupChat');
const Contact = require('./structures/Contact');
const BusinessContact = require('./structures/BusinessContact');
const MessageMedia = require('./structures/MessageMedia');
const Location = require('./structures/Location');
const Poll = require('./structures/Poll');
const Label = require('./structures/Label');
const Injected = require('./util/Injected');

/**
 * Main Client class for interacting with WhatsApp Web
 */
class Client extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = Object.assign({}, DefaultOptions, options);

        if (!this.options.authStrategy) {
            this.options.authStrategy = new LocalAuth();
        }

        this.authStrategy = this.options.authStrategy;
        this.authStrategy.setup(this);

        this.pupBrowser = null;
        this.pupPage = null;
        this.info = null;
    }

    /**
     * Initializes the client and launches Puppeteer browser
     */
    async initialize() {
        let [browser, page] = [null, null];

        await this.authStrategy.beforeBrowserInit();

        this.emit(Events.LOADING_SCREEN, 10, 'Launching Chromium Browser...');

        const puppeteerOpts = this.options.puppeteer;
        if (puppeteerOpts.overrideIsWithTarget) {
            browser = await puppeteer.connect(puppeteerOpts);
        } else {
            browser = await puppeteer.launch(puppeteerOpts);
        }

        page = (await browser.pages())[0] || (await browser.newPage());

        this.pupBrowser = browser;
        this.pupPage = page;

        await this.authStrategy.afterBrowserInit();

        await page.setUserAgent(this.options.userAgent);

        this.emit(Events.LOADING_SCREEN, 30, 'Connecting to WhatsApp Web (web.whatsapp.com)...');

        await page.goto('https://web.whatsapp.com', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        this.emit(Events.LOADING_SCREEN, 60, 'Loading WhatsApp Web Page & Injecting Modules...');

        this.initEvents();

        await this.injectScript();

        this.emit(Events.LOADING_SCREEN, 90, 'Checking Connection & QR Session Status...');
    }

    async injectScript() {
        await this.pupPage.evaluate(Injected.ExposeStore);
    }

    initEvents() {
        // Monitor QR Code & Login State
        this.pupPage.exposeFunction('onQRChanged', (qr) => {
            this.emit(Events.QR_RECEIVED, qr);
        });

        this.pupPage.exposeFunction('onAuthenticated', () => {
            this.emit(Events.AUTHENTICATED);
        });

        this.pupPage.exposeFunction('onReady', async () => {
            this.info = await this.pupPage.evaluate(() => {
                const wid = window.Store && window.Store.User ? window.Store.User.getMaybeMeUser() : null;
                return {
                    wid: wid ? wid._serialized : null,
                    pushname: window.Store && window.Store.User ? window.Store.User.getPushname() : 'User',
                    platform: 'web'
                };
            });
            this.emit(Events.READY);
        });

        this.pupPage.exposeFunction('onDisconnected', (reason) => {
            this.emit(Events.DISCONNECTED, reason);
        });

        this.pupPage.exposeFunction('onMessageReceived', (msgData) => {
            const message = new Message(this, msgData);
            this.emit(Events.MESSAGE_RECEIVED, message);
        });

        // Strict Session & Connection Observer
        this.pupPage.evaluate(() => {
            const getQr = () => {
                const qrEl = document.querySelector('div[data-ref]');
                if (qrEl) return qrEl.getAttribute('data-ref');
                const canvas = document.querySelector('canvas');
                if (canvas) {
                    const parent = canvas.closest('[data-ref]');
                    if (parent) return parent.getAttribute('data-ref');
                }
                return null;
            };

            let lastQr = null;
            let readyTriggered = false;

            setInterval(() => {
                const refreshBtn = document.querySelector('div[data-ref] span button') || document.querySelector('button[aria-label="Reload QR code"]');
                if (refreshBtn) refreshBtn.click();

                const qr = getQr();
                if (qr) {
                    // If QR code element exists, connection is UNPAIRED!
                    readyTriggered = false;
                    if (qr !== lastQr) {
                        lastQr = qr;
                        if (window.onQRChanged) window.onQRChanged(qr);
                    }
                } else {
                    // Check if chat list or search bar is actually visible
                    const isChatListVisible = document.querySelector('div[aria-label="Chat list"]') || 
                                              document.querySelector('div[aria-label="Daftar chat"]') || 
                                              document.querySelector('div[contenteditable="true"][data-tab="3"]');
                    
                    if (isChatListVisible && !readyTriggered) {
                        readyTriggered = true;
                        if (window.onAuthenticated) window.onAuthenticated();
                        if (window.onReady) window.onReady();
                    }
                }
            }, 1000);
        });
    }

    /**
     * Checks if a phone number / user is registered on WhatsApp
     * @param {string} id User ID or phone number (e.g. '628123456789')
     * @returns {Promise<boolean>}
     */
    async isRegisteredUser(id) {
        let formattedId = id.includes('@') ? id : `${id}@c.us`;
        return await this.pupPage.evaluate(async (formattedId) => {
            if (window.Store && window.Store.QueryExist) {
                const result = await window.Store.QueryExist.queryExist(formattedId);
                return result ? result.jid !== undefined : false;
            }
            return true;
        }, formattedId);
    }

    /**
     * Gets the WhatsApp Web version running in the browser
     * @returns {Promise<string>}
     */
    async getWWebVersion() {
        return await this.pupPage.evaluate(() => {
            return window.Debug ? window.Debug.VERSION : '2.3000.x';
        });
    }

    /**
     * Gets current connection state (CONNECTED, UNPAIRED, TIMEOUT, etc.)
     * @returns {Promise<string>}
     */
    async getState() {
        return await this.pupPage.evaluate(() => {
            if (window.Store && window.Store.State) {
                return window.Store.State.default.state;
            }
            const qrEl = document.querySelector('div[data-ref]') || document.querySelector('canvas');
            if (qrEl) return 'UNPAIRED';
            const chatList = document.querySelector('div[aria-label="Chat list"]') || document.querySelector('div[aria-label="Daftar chat"]');
            if (chatList) return 'CONNECTED';
            return 'PAIRING';
        });
    }

    /**
     * Sends a message to a specific chat ID
     * @param {string} chatId Number/Chat ID (e.g. '628123456789@c.us')
     * @param {string|MessageMedia|Location|Poll} content
     * @param {Object} [options]
     * @returns {Promise<Message>}
     */
    async sendMessage(chatId, content, options = {}) {
        let formattedChatId = chatId;
        if (typeof formattedChatId === 'string' && !formattedChatId.includes('@')) {
            formattedChatId = `${formattedChatId}@c.us`;
        }

        let sendOptions = { ...options };

        if (content instanceof MessageMedia) {
            sendOptions.media = content;
        } else if (content instanceof Location) {
            sendOptions.location = content;
        } else if (content instanceof Poll) {
            sendOptions.poll = content;
        }

        const msgData = await this.pupPage.evaluate(async (chatId, content, options) => {
            return await window.WWebJS.sendMessage(chatId, content, options);
        }, formattedChatId, typeof content === 'string' ? content : '', sendOptions);

        return new Message(this, msgData);
    }

    /**
     * Gets all chats
     * @returns {Promise<Array<Chat>>}
     */
    async getChats() {
        const chats = await this.pupPage.evaluate(() => {
            return window.Store && window.Store.Chat ? window.Store.Chat.getModelsArray().map(c => c.serialize()) : [];
        });

        return chats.map(chatData => {
            return chatData.isGroup ? new GroupChat(this, chatData) : new Chat(this, chatData);
        });
    }

    /**
     * Gets a chat by ID
     * @param {string} chatId
     * @returns {Promise<Chat>}
     */
    async getChatById(chatId) {
        const chatData = await this.pupPage.evaluate((id) => {
            const chat = window.Store && window.Store.Chat ? window.Store.Chat.get(id) : null;
            return chat ? chat.serialize() : null;
        }, chatId);

        if (!chatData) return null;
        return chatData.isGroup ? new GroupChat(this, chatData) : new Chat(this, chatData);
    }

    /**
     * Gets all contacts
     * @returns {Promise<Array<Contact>>}
     */
    async getContacts() {
        const contacts = await this.pupPage.evaluate(() => {
            return window.Store && window.Store.Contact ? window.Store.Contact.getModelsArray().map(c => c.serialize()) : [];
        });

        return contacts.map(contactData => {
            return contactData.isBusiness ? new BusinessContact(this, contactData) : new Contact(this, contactData);
        });
    }

    /**
     * Gets a contact by ID
     * @param {string} contactId
     * @returns {Promise<Contact>}
     */
    async getContactById(contactId) {
        const contactData = await this.pupPage.evaluate((id) => {
            const contact = window.Store && window.Store.Contact ? window.Store.Contact.get(id) : null;
            return contact ? contact.serialize() : null;
        }, contactId);

        if (!contactData) return null;
        return contactData.isBusiness ? new BusinessContact(this, contactData) : new Contact(this, contactData);
    }

    /**
     * Creates a new group
     * @param {string} title Group title
     * @param {Array<string>|Array<Contact>} participants
     * @returns {Promise<Object>}
     */
    async createGroup(title, participants) {
        const participantIds = participants.map(p => typeof p === 'string' ? p : p.id._serialized);
        return await this.pupPage.evaluate(async (title, participantIds) => {
            const contacts = participantIds.map(p => window.Store.Contact.get(p));
            return await window.Store.GroupUtils.createGroup(title, contacts);
        }, title, participantIds);
    }

    /**
     * Gets profile picture URL for a contact or group
     * @param {string} contactId
     * @returns {Promise<string>}
     */
    async getProfilePicUrl(contactId) {
        return await this.pupPage.evaluate(async (contactId) => {
            const chat = window.Store && window.Store.Chat ? window.Store.Chat.get(contactId) : null;
            return chat ? await window.Store.ProfilePic.getProfilePicUrl(chat) : null;
        }, contactId);
    }

    /**
     * Gets all Business Labels
     * @returns {Promise<Array<Label>>}
     */
    async getLabels() {
        const labels = await this.pupPage.evaluate(() => {
            return window.Store && window.Store.Label ? window.Store.Label.getModelsArray().map(l => l.serialize()) : [];
        });
        return labels.map(labelData => new Label(this, labelData));
    }

    /**
     * Sets user about / status message
     * @param {string} status
     */
    async setStatus(status) {
        return await this.pupPage.evaluate(async (status) => {
            return await window.Store.Status.setMyStatus(status);
        }, status);
    }

    /**
     * Logs out of WhatsApp Web
     */
    async logout() {
        return await this.pupPage.evaluate(() => {
            return window.Store && window.Store.Cmd ? window.Store.Cmd.logout() : null;
        });
    }

    /**
     * Destroys the client and closes browser
     */
    async destroy() {
        if (this.pupBrowser) {
            await this.pupBrowser.close();
        }
    }
}

module.exports = Client;
