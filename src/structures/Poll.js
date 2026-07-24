'use strict';

/**
 * Poll structure for creating WhatsApp Polls
 */
class Poll {
    /**
     * @param {string} pollName
     * @param {Array<string>} pollOptions
     * @param {Object} [options]
     * @param {boolean} [options.allowMultipleAnswers=false]
     * @param {number} [options.messageSecret]
     */
    constructor(pollName, pollOptions, options = {}) {
        this.pollName = pollName;
        this.pollOptions = pollOptions.map((option, index) => ({
            name: option,
            localId: index
        }));
        this.options = {
            allowMultipleAnswers: options.allowMultipleAnswers || false,
            messageSecret: options.messageSecret
        };
    }
}

module.exports = Poll;
