'use strict';

/**
 * Injected script executed inside the WhatsApp Web browser context
 */
exports.ExposeStore = () => {
    window.WWebJS = window.WWebJS || {};

    const getStore = () => {
        if (window.Store && window.Store.Msg && window.Store.SendTextMsgToChat) {
            return window.Store;
        }

        window.Store = window.Store || {};

        if (window.require) {
            try {
                const collections = window.require('WAWebCollections');
                if (collections) Object.assign(window.Store, collections);
            } catch (e) {}
            try {
                const widFactory = window.require('WAWebWidFactory');
                if (widFactory) window.Store.WidFactory = widFactory;
            } catch (e) {}
            try {
                const sendText = window.require('WAWebSendTextMsgToChatAction');
                if (sendText) window.Store.SendTextMsgToChat = sendText.sendTextMsgToChat || sendText;
            } catch (e) {}
            try {
                const cmd = window.require('WAWebCmd');
                if (cmd) window.Store.Cmd = cmd.Cmd || cmd;
            } catch (e) {}
            try {
                const lid = window.require('WAWebLidUserMap') || window.require('WAWebLidUtils');
                if (lid) window.Store.Lid = lid;
            } catch (e) {}
        }

        if (window.webpackChunkwhatsapp_web_client) {
            window.webpackChunkwhatsapp_web_client.push([
                ['wwebjs_store_finder_' + Date.now()],
                {},
                (require) => {
                    const modules = require.m;
                    for (const id in modules) {
                        try {
                            const mod = require(id);
                            if (!mod) continue;
                            const exp = mod.default || mod;
                            
                            if (exp.Chat && exp.Msg) {
                                window.Store.Chat = exp.Chat;
                                window.Store.Msg = exp.Msg;
                            }
                            if (exp.createWid || exp.createWidFromTarget) {
                                window.Store.WidFactory = exp;
                            }
                            if (exp.sendTextMsgToChat) {
                                window.Store.SendTextMsgToChat = exp.sendTextMsgToChat;
                            }
                            if (exp.openChatAt || exp.openChatFromUser) {
                                window.Store.Cmd = exp;
                            }
                            if (exp.getPNForLID || exp.getCurrentLid) {
                                window.Store.Lid = exp;
                            }
                            if (exp.sendReactionToMsg) {
                                window.Store.Reactions = exp;
                            }
                            if (exp.sendChatStateComposing) {
                                window.Store.ChatStates = exp;
                            }
                        } catch (e) {}
                    }
                }
            ]);
        }

        return window.Store;
    };

    getStore();

    // Helper to resolve @lid to real @c.us phone number Chat JID
    const resolveJid = (jidStr, msgObj) => {
        if (!jidStr || typeof jidStr !== 'string') return jidStr;

        if (jidStr.endsWith('@lid')) {
            const store = getStore();

            if (msgObj) {
                if (msgObj.chat && msgObj.chat.id && msgObj.chat.id._serialized && msgObj.chat.id._serialized.endsWith('@c.us')) {
                    return msgObj.chat.id._serialized;
                }
                if (msgObj.sender && msgObj.sender._serialized && msgObj.sender._serialized.endsWith('@c.us')) {
                    return msgObj.sender._serialized;
                }
            }

            if (store.Msg && store.Msg.models) {
                const found = store.Msg.models.find(m => 
                    (m.from && (m.from._serialized === jidStr || m.from === jidStr)) ||
                    (m.author && (m.author._serialized === jidStr || m.author === jidStr)) ||
                    (m.id && m.id.remote === jidStr)
                );
                if (found && found.chat && found.chat.id && found.chat.id._serialized && found.chat.id._serialized.endsWith('@c.us')) {
                    return found.chat.id._serialized;
                }
            }

            if (store.Lid && store.Lid.getPNForLID) {
                const pn = store.Lid.getPNForLID(jidStr);
                if (pn) return pn._serialized || (typeof pn === 'string' ? pn : `${pn.user}@c.us`);
            }
        }
        return jidStr;
    };

    window.WWebJS.sendChatstate = async (state, chatId) => {
        const store = getStore();
        const resolvedChatId = resolveJid(chatId);
        const chat = store.Chat ? store.Chat.get(resolvedChatId) : null;
        if (!chat) return;
        if (store.ChatStates) {
            if (state === 'typing' && store.ChatStates.sendChatStateComposing) {
                await store.ChatStates.sendChatStateComposing(chat);
            } else if (state === 'recording' && store.ChatStates.sendChatStateRecording) {
                await store.ChatStates.sendChatStateRecording(chat);
            } else if (state === 'stop' && store.ChatStates.sendChatStatePaused) {
                await store.ChatStates.sendChatStatePaused(chat);
            }
        }
    };

    window.WWebJS.sendReaction = async (msgId, reaction) => {
        const store = getStore();
        const msg = store.Msg ? store.Msg.get(msgId) : null;
        if (!msg) return;
        if (store.Reactions && store.Reactions.sendReactionToMsg) {
            await store.Reactions.sendReactionToMsg(msg, reaction);
        }
    };

    window.WWebJS.sendMessage = async (chat, content, options = {}) => {
        const store = getStore();
        let chatIdStr = typeof chat === 'string' ? chat : (chat && chat.id ? (chat.id._serialized || chat.id) : chat);
        chatIdStr = resolveJid(chatIdStr);

        let chatModel = store.Chat ? store.Chat.get(chatIdStr) : null;
        if (!chatModel && store.Chat && store.Chat.find) {
            try {
                chatModel = await store.Chat.find(chatIdStr);
            } catch (e) {
                try {
                    chatModel = await store.Chat.find.call(store.Chat, chatIdStr);
                } catch (err) {}
            }
        }

        if (!chatModel && store.Chat && store.Chat.models) {
            chatModel = store.Chat.models.find(c => c.id && (c.id._serialized === chatIdStr || c.id.user === chatIdStr));
        }

        let wid = (store.WidFactory && store.WidFactory.createWid) 
            ? store.WidFactory.createWid(chatIdStr) 
            : { _serialized: chatIdStr, user: chatIdStr.split('@')[0] };

        if (!chatModel) {
            chatModel = { id: wid };
        }

        // Open chat thread in UI to bind WebSocket frame transmission
        if (store.Cmd) {
            try {
                if (store.Cmd.openChatAt) {
                    await store.Cmd.openChatAt(chatModel);
                } else if (store.Cmd.openChatFromUser) {
                    await store.Cmd.openChatFromUser(chatModel);
                }
            } catch (e) {}
        }

        let internalOptions = {
            linkPreview: undefined,
            mentionedJidList: options.mentions || [],
            quotedMsg: options.quotedMessageId && store.Msg ? store.Msg.get(options.quotedMessageId) : undefined
        };

        try {
            if (typeof store.SendTextMsgToChat === 'function') {
                return await store.SendTextMsgToChat(chatModel, content, internalOptions);
            } else if (store.SendMessage && typeof store.SendMessage.sendTextMsgToChat === 'function') {
                return await store.SendMessage.sendTextMsgToChat(chatModel, content, internalOptions);
            } else if (store.SendMessage && typeof store.SendMessage.addAndSendMsgToChat === 'function') {
                let msgData = {
                    id: store.MsgKey ? store.MsgKey.newId() : '3EB0' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                    to: wid,
                    body: typeof content === 'string' ? content : '',
                    type: 'chat',
                    t: Math.floor(Date.now() / 1000)
                };
                if (internalOptions.quotedMsg) msgData.quotedMsg = internalOptions.quotedMsg;
                await store.SendMessage.addAndSendMsgToChat(chatModel, msgData);
                return msgData;
            }
        } catch (e) {
            console.error('SendMessage internal error:', e.message);
        }

        return { id: wid, body: content };
    };

    // Store & Polling Listener for New Messages
    const processedMsgs = new Set();

    const checkNewMessages = () => {
        try {
            const store = getStore();
            if (store.Msg && store.Msg.getModelsArray) {
                const models = store.Msg.getModelsArray();
                for (let i = models.length - 1; i >= Math.max(0, models.length - 30); i--) {
                    const msg = models[i];
                    if (!msg) continue;

                    let rawFrom = msg.from ? (msg.from._serialized || msg.from) : msg.from;
                    let resolvedFrom = resolveJid(rawFrom, msg);

                    let rawTo = msg.to ? (msg.to._serialized || msg.to) : msg.to;
                    let resolvedTo = resolveJid(rawTo, msg);

                    const serialized = msg.serialize ? msg.serialize() : {
                        id: msg.id,
                        body: msg.body,
                        from: resolvedFrom,
                        to: resolvedTo,
                        type: msg.type,
                        t: msg.t
                    };
                    serialized.from = resolvedFrom;
                    serialized.to = resolvedTo;

                    const msgKey = serialized.id ? (serialized.id._serialized || serialized.id) : `${serialized.from}_${serialized.t}`;
                    if (!processedMsgs.has(msgKey)) {
                        processedMsgs.add(msgKey);
                        if (window.onMessageReceived) {
                            window.onMessageReceived(serialized);
                        }
                    }
                }
            }
        } catch (err) {}
    };

    setInterval(checkNewMessages, 800);
};
