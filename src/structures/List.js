'use strict';

/**
 * List structure (Deprecated in official WhatsApp Web API, maintained for backwards compatibility)
 */
class List {
    /**
     * @param {string} body
     * @param {string} buttonText
     * @param {Array<{title: string, rows: Array<{id: string, title: string, description: string}>}>} sections
     * @param {string} [title]
     * @param {string} [footer]
     */
    constructor(body, buttonText, sections, title, footer) {
        this.body = body;
        this.buttonText = buttonText;
        this.sections = sections;
        this.title = title;
        this.footer = footer;
    }
}

module.exports = List;
