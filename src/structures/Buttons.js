'use strict';

/**
 * Buttons structure (Deprecated in official WhatsApp Web API, maintained for backwards compatibility)
 */
class Buttons {
    /**
     * @param {string|MessageMedia} body
     * @param {Array<{id: string, body: string}>} buttons
     * @param {string} [title]
     * @param {string} [footer]
     */
    constructor(body, buttons, title, footer) {
        this.body = body;
        this.buttons = this._format(buttons);
        this.title = title;
        this.footer = footer;
    }

    _format(buttons) {
        return buttons.map((btn, index) => ({
            buttonId: btn.id || String(index),
            buttonText: { displayText: btn.body },
            type: 1
        }));
    }
}

module.exports = Buttons;
