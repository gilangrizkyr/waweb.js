# 🚀 WhatsApp Bot & REST API Gateway

Aplikasi WhatsApp API Gateway & Notification Server modern berbasis Node.js dan Express. Dilengkapi dengan REST API berautentikasi token, WebSocket realtime, Dashboard UI, serta tampilan QR Code yang dapat di-embed menggunakan `<iframe>`.

---

## 📋 Fitur Utama

- 🔑 **REST API Ber-token**: Kirim pesan WhatsApp via HTTP POST request menggunakan header `X-API-Token`.
- 📱 **QR Code Realtime & iframe Support**: Tampilkan QR code secara live di aplikasi/sistem lain menggunakan `<iframe>`.
- 🔔 **WebSocket Realtime Notification**: Terima notifikasi pesan masuk & keluar secara live tanpa polling.
- 📊 **Dashboard UI Modern**: Tampilan web dashboard interaktif untuk monitoring status, log pesan, dan testing API.
- 🤖 **Support Bot Auto-Reply**: Kode logika bot bawaan yang siap diaktifkan kapan saja.
- 💾 **Persistensi Sesi**: Menggunakan `LocalAuth` sehingga cukup scan QR 1x dan sesi tersimpan otomatis.

---

## 🛠️ Prasyarat (Prerequisites)

Pastikan perangkat/server Anda telah terinstall:
- **Node.js** (v18.0.0 atau yang terbaru)
- **npm** (Node Package Manager)
- **Git**

---

## 🚀 Panduan Memulai (Step-by-step Setup)

### 1. Clone Repository & Masuk ke Folder Proyek
Buka terminal dan jalankan perintah clone repository ini:

```bash
git clone <URL_REPOSITORY_ANDA>
cd waweb.js
```

### 2. Install Dependensi
Install seluruh paket dependensi yang dibutuhkan:

```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Buat file `.env` dari file template `.env.example`:

```bash
cp .env.example .env
```

Atau buat file `.env` manual:

```bash
cat <<EOF > .env
API_TOKEN=wbot-secret-token-gantilah-ini-dengan-token-anda
PORT=3000
EOF
```

> ⚠️ **Penting**: Ubah `API_TOKEN` sesuai dengan token rahasia yang ingin Anda gunakan untuk mengamankan REST API Anda.

### 4. Jalankan Server

#### A. Mode Pengujian (Development Mode):
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

#### B. Mode Production (Background Process dengan PM2):
Agar aplikasi tetap berjalan 24/7 di latar belakang (bahkan saat terminal ditutup):

```bash
# Install PM2 secara global (jika belum ada)
npm install -g pm2

# Jalankan server dengan PM2
pm2 start server.js --name "wa-api-gateway"

# Cek status & log
pm2 status
pm2 logs wa-api-gateway
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

### 1. Menggunakan cURL:

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "X-API-Token: wbot-secret-token-gantilah-ini-dengan-token-anda" \
  -d '{
    "to": "6281234567890",
    "message": "Halo! Pesan ini dikirim otomatis via API WhatsApp."
  }'
```

### 2. Menggunakan PHP (cURL):

```php
<?php
$url = 'http://localhost:3000/api/send';
$token = 'wbot-secret-token-gantilah-ini-dengan-token-anda';

$data = array(
    'to' => '6281234567890',
    'message' => 'Halo dari aplikasi PHP!'
);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'X-API-Token: ' . $token
));

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

### 3. Menggunakan JavaScript (Fetch):

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

Jika Anda ingin menampilkan QR Code WhatsApp Gateway di dalam sistem/aplikasi web Anda sendiri (misal: SIM / CRM / Admin Panel), tambahkan kode HTML berikut:

```html
<iframe 
    src="http://localhost:3000/qr-view" 
    width="260" 
    height="320" 
    frameborder="0"
    style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
</iframe>
```

QR Code di dalam `<iframe>` akan otomatis diperbarui secara realtime via WebSocket saat terjadi perubahan status atau saat sesi perlu diperbarui.

---

## 🔧 Troubleshooting & Tips

### 1. Bagaimana cara mengganti akun WhatsApp atau scan QR ulang?
Hapus folder sesi lokal `.wwebjs_auth` lalu jalankan kembali `node server.js`:
```bash
rm -rf .wwebjs_auth
node server.js
```

### 2. Error Puppeteer di Server Linux (Ubuntu/Debian)
Jika berjalan di server Linux tanpa tampilan layar, pastikan library pendukung Puppeteer terpasang:
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
```

---

## 📂 Struktur Proyek

```text
waweb.js/
├── server.js            # Express API Server & WebSocket Handler
├── example.js           # Contoh script WhatsApp Client standalone
├── .env                 # File Konfigurasi (API_TOKEN & PORT)
├── .env.example         # Template konfigurasi environment
├── public/
│   ├── index.html       # Web Dashboard Monitoring & API Test UI
│   └── qr.html          # Halaman Standalone QR Code untuk iframe
├── dokumentasi.md       # Dokumentasi API & WebSocket Lanjutan
└── README.md            # Panduan Memulai
```

---

## 📖 Dokumentasi Lengkap

Untuk melihat dokumentasi API terperinci, struktur payload WebSocket event, dan panduan mengaktifkan fitur bot auto-reply bawaan, silakan baca file **[dokumentasi.md](dokumentasi.md)**.

---

## 📄 Lisensi

MIT License.
