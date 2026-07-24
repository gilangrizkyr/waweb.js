'use strict';

exports.WhatsWebURL = 'https://web.whatsapp.com';

exports.UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

exports.DefaultOptions = {
    puppeteer: {
        headless: true,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    webVersion: '2.3000.1014722238-alpha',
    webVersionCache: {
        type: 'local',
        path: './.wwebjs_cache'
    },
    authStrategy: null,
    takeoverOnConflict: false,
    takeoverTimeoutMs: 0,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    ffmpegPath: 'ffmpeg'
};

exports.Status = {
    INITIALIZING: 0,
    AUTHENTICATED: 1,
    READY: 2,
    UNPAIRED: 3,
    UNPAIRED_IDLE: 4
};

exports.Events = {
    AUTHENTICATED: 'authenticated',
    AUTHENTICATION_FAILURE: 'auth_failure',
    READY: 'ready',
    CHAT_REMOVED: 'chat_removed',
    CHAT_ARCHIVED: 'chat_archived',
    MESSAGE_RECEIVED: 'message',
    MESSAGE_CREATE: 'message_create',
    MESSAGE_REVOKE_EVERYONE: 'message_revoke_everyone',
    MESSAGE_REVOKE_ME: 'message_revoke_me',
    MESSAGE_ACK: 'message_ack',
    MESSAGE_EDIT: 'message_edit',
    MESSAGE_REACTION: 'message_reaction',
    MEDIA_UPLOADED: 'media_uploaded',
    CONTACT_CHANGED: 'contact_changed',
    GROUP_JOIN: 'group_join',
    GROUP_LEAVE: 'group_leave',
    GROUP_UPDATE: 'group_update',
    GROUP_ADMIN_CHANGED: 'group_admin_changed',
    GROUP_MEMBERSHIP_REQUEST: 'group_membership_request',
    CHANGE_STATE: 'change_state',
    DISCONNECTED: 'disconnected',
    STATE_CHANGED: 'state_changed',
    CALL: 'call',
    VOTE: 'vote',
    QR_RECEIVED: 'qr',
    LOADING_SCREEN: 'loading_screen'
};

exports.MessageTypes = {
    TEXT: 'chat',
    AUDIO: 'audio',
    VOICE: 'ptt',
    IMAGE: 'image',
    VIDEO: 'video',
    DOCUMENT: 'document',
    STICKER: 'sticker',
    LOCATION: 'location',
    CONTACT_CARD: 'vcard',
    CONTACT_CARD_MULTI: 'multi_vcard',
    REVOKED: 'revoked',
    UNKNOWN: 'unknown',
    GROUP_INVITE: 'groups_v4_invite',
    LIST: 'list',
    LIST_RESPONSE: 'list_response',
    BUTTONS_RESPONSE: 'buttons_response',
    PAYMENT: 'payment',
    REACTION: 'reaction',
    POLL_CREATION: 'poll_creation',
    NATIVE_FLOW: 'native_flow'
};

exports.GroupNotificationTypes = {
    ADD: 'add',
    INVITE: 'invite',
    REMOVE: 'remove',
    LEAVE: 'leave',
    SUBJECT: 'subject',
    DESCRIPTION: 'description',
    PICTURE: 'picture',
    ANNOUNCE: 'announce',
    RESTRICT: 'restrict'
};

exports.ChatTypes = {
    SOLO: 'solar',
    GROUP: 'group',
    UNKNOWN: 'unknown'
};

exports.WAState = {
    CONFLICT: 'CONFLICT',
    CONNECTED: 'CONNECTED',
    DEPRECATED_VERSION: 'DEPRECATED_VERSION',
    OPENING: 'OPENING',
    PAIRING: 'PAIRING',
    PROXYBLOCK: 'PROXYBLOCK',
    SMB_TOS_BLOCK: 'SMB_TOS_BLOCK',
    TIMEOUT: 'TIMEOUT',
    UNLAUNCHED: 'UNLAUNCHED',
    UNPAIRED: 'UNPAIRED',
    UNPAIRED_IDLE: 'UNPAIRED_IDLE'
};

exports.MessageAck = {
    ACK_ERROR: -1,
    ACK_PENDING: 0,
    ACK_SERVER: 1,
    ACK_DEVICE: 2,
    ACK_READ: 3,
    ACK_PLAYED: 4
};
