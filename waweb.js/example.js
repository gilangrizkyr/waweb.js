'use strict';

const {
    Client,
    LocalAuth,
    Location,
    Poll
} = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');

console.log('[BOT] Starting WhatsApp client...');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'bot-session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

client.on('loading_screen', (percent, message) => {
    console.log(`[LOAD] ${percent}% - ${message}`);
});

client.on('qr', (qr) => {
    console.log('\n[AUTH] Scan QR Code dengan WhatsApp:\n');
    qrcode.generate(qr, {
        small: true
    });
});

client.on('authenticated', () => {
    console.log('[AUTH] Login berhasil');
});

client.on('ready', () => {
    console.log(`
========================================
 WhatsApp Bot Online
 Status : Ready
========================================
    `);
});

client.on('disconnected', (reason) => {
    console.log('[SYSTEM] Client disconnected:', reason);
});


client.on('message', async (message) => {
    if (message.isStatus) return;

    const text = message.body.trim();

    console.log(`[MESSAGE] ${message.from}: ${text}`);

    try {
        switch (true) {

            case text === '!ping':
                await message.reply('pong');
                break;


            case text === '!reaction':
                await message.react('👍');
                break;


            case text === '!location': {
                const location = new Location(
                    -6.2088,
                    106.8456,
                    'Jakarta, Indonesia'
                );

                await client.sendMessage(
                    message.from,
                    location
                );
                break;
            }


            case text === '!poll': {
                const poll = new Poll(
                    'Apa bahasa pemrograman favorit kamu?',
                    [
                        'JavaScript',
                        'Python',
                        'TypeScript',
                        'Go'
                    ]
                );

                await client.sendMessage(
                    message.from,
                    poll
                );
                break;
            }


            case text.startsWith('!echo '):
                await message.reply(
                    text.substring(6)
                );
                break;


            default:
                if (text) {
                    const reply = `
Halo, pesan kamu sudah diterima.

Daftar perintah:
- !ping
- !reaction
- !location
- !poll
- !echo [teks]
                    `.trim();

                    await message.reply(reply);
                }

        }

    } catch (error) {
        console.error(
            '[ERROR]',
            error.message
        );
    }
});


client.initialize();