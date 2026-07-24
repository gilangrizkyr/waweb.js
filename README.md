# 🚀 WhatsApp Bot & REST API Gateway

Aplikasi WhatsApp API Gateway & Notification Server modern berbasis Node.js dan Express. Dilengkapi dengan REST API berautentikasi token, WebSocket realtime, Dashboard UI, serta tampilan QR Code yang dapat di-embed menggunakan `<iframe>`.

---

## 📋 Fitur Utama

- 🔑 **REST API Ber-token**: Kirim pesan WhatsApp via HTTP POST request menggunakan header `X-API-Token`.
- 📱 **QR Code Realtime & iframe Support**: Tampilkan QR code secara live di aplikasi lain menggunakan `<iframe>`.
- 🔔 **WebSocket Realtime Notification**: Terima notifikasi pesan masuk & keluar secara live tanpa polling.
- 📊 **Dashboard UI Modern**: Tampilan web dashboard interaktif untuk monitoring status, log pesan, dan testing API.
- 🤖 **Support Bot Auto-Reply**: Kode logika bot bawaan yang siap diaktifkan kapan saja.

---

## 🛠️ Prasyarat (Prerequisites)

Pastikan perangkat/server Anda telah terinstall:
- **Node.js** v18.0.0 atau yang terbaru
- **npm** (Node Package Manager)
- **Git**

---

## 🚀 Panduan Memulai (Step-by-step Setup)

### 1. Clone Repository
Buka terminal dan jalankan perintah clone repository ini:

```bash
git clone <URL_REPOSITORY_ANDA>
cd webjs
```

### 2. Install Dependensi
Install seluruh paket dependensi yang dibutuhkan:

```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` (atau buat file baru bernama `.env` di direktori utama proyek):

```bash
cat <<EOF > .env
API_TOKEN=wbot-secret-token-gantilah-ini-dengan-token-anda
PORT=3000
EOF
```

> ⚠️ **Penting**: Ubah `API_TOKEN` sesuai dengan token rahasia yang ingin Anda gunakan untuk mengamankan API Anda.

### 4. Jalankan Server
Jalankan server aplikasi:

```bash
node server.js
```

Jika server berhasil berjalan, Anda akan melihat output terminal seperti berikut:

```text
╔══════════════════════════════════════════════════╗
║  🤖 WhatsApp Bot API Server                      ║
║  🌐 Dashboard : http://localhost:3000           ║
║  📡 WebSocket : ws://localhost:3000             ║
║  🔑 API Token : wbot-secret-token-g...          ║
╚══════════════════════════════════════════════════╝
```

---

## 📱 Cara Menghubungkan WhatsApp (Scan QR)

1. Buka browser dan kunjungi Dashboard di `http://localhost:3000/`.
2. Buka aplikasi **WhatsApp** di HP Anda.
3. Masuk ke **Menu (Titik tiga / Pengaturan)** > **Perangkat Tertaut (Linked Devices)**.
4. Tekan **Tautkan Perangkat (Link a Device)** dan scan QR Code yang muncul di layar.
5. Setelah berhasil, status di dashboard akan berubah menjadi **`READY`** (Warna Hijau).

---

## 📤 Cara Mengirim Pesan via API

### Menggunakan cURL:

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "X-API-Token: wbot-secret-token-gantilah-ini-dengan-token-anda" \
  -d '{
    "to": "6281234567890",
    "message": "Halo! Pesan ini dikirim otomatis via API WhatsApp."
  }'
```

### Menggunakan JavaScript (Fetch):

```javascript
const response = await fetch('http://localhost:3000/api/send', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-API-Token': 'wbot-secret-token-gantilah-ini-dengan-token-anda'
    },
    body: JSON.stringify({
        to: '6281234567890',
        message: 'Halo dari JavaScript!'
    })
});

const result = await response.json();
console.log(result);
```

---

## 🖼️ Embed QR Code di Web / Aplikasi Lain (`<iframe>`)

Jika Anda ingin menampilkan QR Code WhatsApp Gateway di dalam sistem/aplikasi web Anda sendiri, cukup tambahkan kode HTML berikut:

```html
<iframe 
    src="http://localhost:3000/qr-view" 
    width="260" 
    height="320" 
    frameborder="0"
    style="border-radius: 12px; overflow: hidden; border: 1px solid #ccc;">
</iframe>
```

QR Code di dalam `<iframe>` akan otomatis diperbarui secara realtime via WebSocket saat terjadi perubahan status atau saat sesi perlu diperbarui.

---

## 📂 Struktur Proyek

```text
.
├── server.js            # Main Express & WebSocket API Server
├── example.js           # Script contoh penggunaan WhatsApp Client
├── .env                 # File konfigurasi environment (Token & Port)
├── public/
│   ├── index.html       # Web Dashboard Monitoring & Testing API
│   └── qr.html          # Halaman Standalone QR Code untuk iframe
├── src/                 # Modul pendukung
├── dokumentasi.md       # Dokumentasi API & WebSocket Lanjutan
└── README.md            # Panduan Memulai (File Ini)
```

---

## 📖 Dokumentasi Lengkap

Untuk melihat dokumentasi API terperinci, struktur WebSocket event, dan panduan mengaktifkan fitur bot auto-reply, silakan baca file **[dokumentasi.md](dokumentasi.md)**.

---

## 📄 Lisensi

MIT License.
# waweb.js
