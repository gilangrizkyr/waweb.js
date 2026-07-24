'use strict';

const Client = require('./src/Client');
const LocalAuth = require('./src/authStrategies/LocalAuth');
const NoAuth = require('./src/authStrategies/NoAuth');
const RemoteAuth = require('./src/authStrategies/RemoteAuth');

const MessageMedia = require('./src/structures/MessageMedia');
const Location = require('./src/structures/Location');
const Poll = require('./src/structures/Poll');
const Buttons = require('./src/structures/Buttons');
const List = require('./src/structures/List');
const Call = require('./src/structures/Call');
const Label = require('./src/structures/Label');
const Message = require('./src/structures/Message');
const Chat = require('./src/structures/Chat');
const GroupChat = require('./src/structures/GroupChat');
const PrivateChat = require('./src/structures/PrivateChat');
const Contact = require('./src/structures/Contact');
const BusinessContact = require('./src/structures/BusinessContact');
const GroupNotification = require('./src/structures/GroupNotification');

const Constants = require('./src/util/Constants');

module.exports = {
    Client,
    LocalAuth,
    NoAuth,
    RemoteAuth,
    MessageMedia,
    Location,
    Poll,
    Buttons,
    List,
    Call,
    Label,
    Message,
    Chat,
    GroupChat,
    PrivateChat,
    Contact,
    BusinessContact,
    GroupNotification,
    ...Constants
};
