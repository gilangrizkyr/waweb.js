'use strict';

/**
 * Bot WhatsApp menggunakan library resmi whatsapp-web.js
 * https://github.com/wwebjs/whatsapp-web.js
 */
const { Client, LocalAuth, MessageMedia, Location, Poll } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Initializing WhatsApp Bot...');

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
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading: [${percent}%] ${message}`);
});

client.on('qr', (qr) => {
    console.log('\n✅ QR Code siap! Scan dengan WhatsApp:\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('🎉 Authentication successful!');
});

client.on('ready', () => {
    console.log('\n======================================================');
    console.log('🤖 BOT WHATSAPP SUDAH AKTIF DAN SIAP MENERIMA PESAN!');
    console.log('📌 Silakan kirim pesan ke nomor WhatsApp ini.');
    console.log('======================================================\n');
});

client.on('disconnected', (reason) => {
    console.log('❌ Bot disconnected:', reason);
});

client.on('message', async (msg) => {
    if (msg.isStatus) return;

    console.log(`📩 [Pesan dari ${msg.from}]: "${msg.body}"`);

    try {
        if (msg.body === '!ping') {
            await msg.reply('pong');
            console.log('📤 [Bot Membalas]: "pong"');

        } else if (msg.body === '!reaction') {
            await msg.react('👍');
            console.log('📤 [Bot React]: 👍');

        } else if (msg.body === '!location') {
            const loc = new Location(-6.2088, 106.8456, 'Jakarta, Indonesia');
            await client.sendMessage(msg.from, loc);
            console.log('📤 [Bot Kirim]: Lokasi Jakarta');

        } else if (msg.body === '!poll') {
            const poll = new Poll('Apa bahasa pemrograman favoritmu?', [
                'JavaScript', 'Python', 'TypeScript', 'Go'
            ]);
            await client.sendMessage(msg.from, poll);
            console.log('📤 [Bot Kirim]: WhatsApp Poll');

        } else if (msg.body.startsWith('!echo ')) {
            const echoText = msg.body.slice(6);
            await msg.reply(echoText);
            console.log(`📤 [Bot Echo]: "${echoText}"`);

        } else if (msg.body.trim()) {
            const responseText = `🤖 *Bot Auto-Reply*\n\nHalo! Pesan Anda: _"${msg.body}"_ sudah diterima.\n\n*Perintah tersedia:*\n• *!ping* - Test koneksi\n• *!reaction* - React emoji 👍\n• *!location* - Kirim lokasi\n• *!poll* - Buat polling\n• *!echo [teks]* - Echo teks`;
            await msg.reply(responseText);
            console.log(`📤 [Bot Auto-Reply]`);
        }
    } catch (err) {
        console.error('❌ Error saat membalas pesan:', err.message);
    }
});

client.initialize();
