'use strict';

require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const QRCode = require('qrcode');
const { Client, LocalAuth, MessageMedia, Location, Poll } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Token Auth ──────────────────────────────────────────────────────────────
const API_TOKEN = process.env.API_TOKEN || 'wbot-default-token';

function authMiddleware(req, res, next) {
    const token = req.headers['x-api-token'] || req.query.token;
    if (!token || token !== API_TOKEN) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing X-API-Token header' });
    }
    next();
}

// ─── State ────────────────────────────────────────────────────────────────────
let whatsappState = 'DISCONNECTED'; // DISCONNECTED | QR | AUTHENTICATED | READY
let currentQR = null;
const messageLog = [];

// ─── WebSocket Broadcast ──────────────────────────────────────────────────────
function broadcast(event, data) {
    const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('📡 [WS] Client connected to WebSocket');

    // Send current state to newly connected client
    ws.send(JSON.stringify({
        event: 'state',
        data: { status: whatsappState, qr: currentQR },
        timestamp: new Date().toISOString()
    }));

    // Send recent message log
    ws.send(JSON.stringify({
        event: 'message_log',
        data: messageLog.slice(-50),
        timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
        console.log('📡 [WS] Client disconnected');
    });
});

// ─── WhatsApp Client ──────────────────────────────────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot-session' }),
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
    console.log(`⏳ [WA] Loading: [${percent}%] ${message}`);
    broadcast('loading', { percent, message });
});

client.on('qr', async (qr) => {
    console.log('📱 [WA] QR Code baru diterima, broadcast ke semua client...');
    whatsappState = 'QR';
    currentQR = qr;
    try {
        const qrDataURL = await QRCode.toDataURL(qr, { margin: 2, width: 300 });
        broadcast('qr', { qr, qrDataURL });
    } catch (e) {
        broadcast('qr', { qr, qrDataURL: null });
    }
});

client.on('authenticated', () => {
    console.log('🎉 [WA] Authentication successful!');
    whatsappState = 'AUTHENTICATED';
    currentQR = null;
    broadcast('authenticated', { message: 'WhatsApp berhasil terautentikasi!' });
});

client.on('ready', () => {
    console.log('✅ [WA] Bot siap menerima & mengirim pesan!');
    whatsappState = 'READY';
    currentQR = null;
    broadcast('ready', { message: 'Bot WhatsApp siap digunakan!' });
});

client.on('disconnected', (reason) => {
    console.log('❌ [WA] Disconnected:', reason);
    whatsappState = 'DISCONNECTED';
    currentQR = null;
    broadcast('disconnected', { reason });
});

client.on('message', async (msg) => {
    if (msg.isStatus) return;

    const logEntry = {
        id: msg.id._serialized,
        from: msg.from,
        body: msg.body,
        type: msg.type,
        timestamp: new Date().toISOString(),
        direction: 'incoming'
    };

    messageLog.push(logEntry);
    if (messageLog.length > 200) messageLog.shift();

    console.log(`📩 [Pesan dari ${msg.from}]: "${msg.body}"`);
    broadcast('message_received', logEntry);

    // ─── Bot Commands (dinonaktifkan sementara) ───────────────
    /*
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
    */
});

// ─── REST API Endpoints ───────────────────────────────────────────────────────

// GET /api/status - Status koneksi WhatsApp
app.get('/api/status', authMiddleware, (req, res) => {
    res.json({
        success: true,
        status: whatsappState,
        connected: whatsappState === 'READY'
    });
});

// POST /api/send - Kirim pesan WhatsApp (Support Single & Multi-Recipient)
// Header: X-API-Token: <token>
// Body: { to: "6281234567890, 08987654321" ATAU ["6281234567890", "08987654321"], message: "Halo!" }
app.post('/api/send', authMiddleware, async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({
            success: false,
            error: 'Parameter "to" (nomor tujuan) dan "message" (isi pesan) wajib diisi'
        });
    }

    if (whatsappState !== 'READY') {
        return res.status(503).json({
            success: false,
            error: `Bot belum siap. Status saat ini: ${whatsappState}. Tunggu hingga QR discan dan bot berstatus READY.`
        });
    }

    // Parse target numbers (support array or comma-separated string)
    let rawTargets = [];
    if (Array.isArray(to)) {
        rawTargets = to;
    } else if (typeof to === 'string') {
        rawTargets = to.split(',').map(s => s.trim()).filter(Boolean);
    } else {
        rawTargets = [to.toString()];
    }

    if (rawTargets.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Tidak ada nomor tujuan yang valid'
        });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const rawTo of rawTargets) {
        try {
            let chatId = rawTo.toString().replace(/[^0-9]/g, '');
            if (!chatId.endsWith('@c.us') && !chatId.includes('@')) {
                chatId = `${chatId}@c.us`;
            }

            const sentMsg = await client.sendMessage(chatId, message);

            const logEntry = {
                id: sentMsg && sentMsg.id ? (sentMsg.id._serialized || sentMsg.id) : `sent_${Date.now()}`,
                to: chatId,
                body: message,
                type: 'chat',
                timestamp: new Date().toISOString(),
                direction: 'outgoing'
            };

            messageLog.push(logEntry);
            if (messageLog.length > 200) messageLog.shift();

            broadcast('message_sent', logEntry);

            console.log(`📤 [API] Pesan terkirim ke ${chatId}: "${message}"`);

            results.push({
                to: chatId,
                status: 'sent',
                messageId: logEntry.id
            });
            successCount++;

        } catch (err) {
            console.error(`❌ [API] Gagal kirim ke ${rawTo}:`, err.message);
            results.push({
                to: rawTo,
                status: 'failed',
                error: err.message
            });
            failCount++;
        }
    }

    res.json({
        success: successCount > 0,
        message: `Pengiriman selesai. Success: ${successCount}, Failed: ${failCount}`,
        summary: {
            total: rawTargets.length,
            successCount,
            failCount
        },
        data: results
    });
});

// GET /api/qr - Dapatkan QR code saat ini (sebagai data URL image)
app.get('/api/qr', authMiddleware, async (req, res) => {
    if (!currentQR) {
        return res.json({ success: false, error: 'Tidak ada QR Code aktif. Bot sudah terhubung atau belum dimulai.' });
    }
    try {
        const qrDataURL = await QRCode.toDataURL(currentQR, { margin: 2, width: 300 });
        res.json({ success: true, qr: currentQR, qrDataURL });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// GET /api/messages - Log pesan masuk & keluar
app.get('/api/messages', authMiddleware, (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({
        success: true,
        total: messageLog.length,
        messages: messageLog.slice(-limit)
    });
});

// QR iframe-embeddable page (dapat di-embed di aplikasi lain)
app.get('/qr-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

// Dashboard UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  🤖 WhatsApp Bot API Server                      ║`);
    console.log(`║  🌐 Dashboard : http://localhost:${PORT}           ║`);
    console.log(`║  📡 WebSocket : ws://localhost:${PORT}             ║`);
    console.log(`║  🔑 API Token : ${API_TOKEN.substring(0, 20)}...      ║`);
    console.log('╚══════════════════════════════════════════════════╝\n');
});

console.log('🔄 Initializing WhatsApp Client...');
client.initialize();
