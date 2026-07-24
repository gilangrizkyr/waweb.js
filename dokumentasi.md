# 📚 Dokumentasi WhatsApp Gateway & REST API

Aplikasi WhatsApp Gateway berbasis Node.js yang menyediakan REST API, WebSocket realtime untuk notifikasi & QR code, serta tampilan QR code via `<iframe>`.

---

## 📌 Daftar Isi
1. [Instalasi & Pengaturan](#1-instalasi--pengaturan)
2. [Menjalankan Server](#2-menjalankan-server)
3. [Autentikasi API Token](#3-autentikasi-api-token)
4. [Dokumentasi Endpoints REST API](#4-dokumentasi-endpoints-rest-api)
   - [POST /api/send](#-post-apisend)
   - [GET /api/status](#-get-apistatus)
   - [GET /api/qr](#-get-apiqr)
   - [GET /api/messages](#-get-apimessages)
5. [Integrasi QR Code via iframe](#5-integrasi-qr-code-via-iframe)
6. [WebSocket Realtime (Notifikasi & Status)](#6-websocket-realtime-notifikasi--status)
7. [Mengaktifkan Kembali Bot Auto-Reply](#7-mengaktifkan-kembali-bot-auto-reply)

---

## 1. Instalasi & Pengaturan

Pastikan Node.js (v18+) sudah terinstall di sistem Anda.

Konfigurasi aplikasi terdapat pada file `.env`:

```env
API_TOKEN=wbot-secret-token-gantilah-ini-dengan-token-anda
PORT=3000
```

> **Catatan Security:** Ubah `API_TOKEN` sesuai dengan token rahasia yang Anda inginkan.

---

## 2. Menjalankan Server

Untuk menjalankan server WhatsApp Gateway:

```bash
cd /persistent/home/Gilang/webjs
node server.js
```

Setelah dijalankan, server akan aktif pada:
- **Dashboard UI**: `http://localhost:3000/`
- **QR View (iframe)**: `http://localhost:3000/qr-view`
- **WebSocket**: `ws://localhost:3000/`

---

## 3. Autentikasi API Token

Setiap panggilan ke REST API wajib menyertakan header HTTP berikut:

```http
X-API-Token: wbot-secret-token-gantilah-ini-dengan-token-anda
```

---

## 4. Dokumentasi Endpoints REST API

### 📤 POST `/api/send`
Mengirim pesan WhatsApp ke nomor tujuan.

#### Request Headers:
| Header | Type | Value |
| --- | --- | --- |
| `Content-Type` | `string` | `application/json` |
| `X-API-Token` | `string` | `[API_TOKEN Anda]` |

#### Request Body (Mendukung Multi-Nomor / Broadcast):
Bisa menggunakan **String dipisahkan koma** atau **Array of Strings**:

```json
{
  "to": "6281234567890, 08987654321, 62811223344",
  "message": "Halo! Ini pesan broadcast ke banyak nomor."
}
```

Atau menggunakan Array:

```json
{
  "to": ["6281234567890", "08987654321"],
  "message": "Halo! Ini pesan dikirim via array."
}
```

> **Format Nomor (`to`):** Bisa menggunakan format `628xxx` atau `08xxx`. Setiap nomor akan diproses dan dikirim satu per satu secara otomatis.

#### Example Response (Success - 200 OK):
```json
{
  "success": true,
  "message": "Pengiriman selesai. Success: 2, Failed: 0",
  "summary": {
    "total": 2,
    "successCount": 2,
    "failCount": 0
  },
  "data": [
    {
      "to": "6281234567890@c.us",
      "status": "sent",
      "messageId": "true_6281234567890@c.us_3EB0..."
    },
    {
      "to": "628987654321@c.us",
      "status": "sent",
      "messageId": "true_628987654321@c.us_3EB0..."
    }
  ]
}
```

#### Example cURL Request:
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "X-API-Token: wbot-secret-token-gantilah-ini-dengan-token-anda" \
  -d '{
    "to": "6281234567890",
    "message": "Tes kirim pesan"
  }'
```

---

### 📊 GET `/api/status`
Mengecek status koneksi WhatsApp Gateway.

#### Request Headers:
`X-API-Token: [API_TOKEN]`

#### Example Response:
```json
{
  "success": true,
  "status": "READY",
  "connected": true
}
```

Status yang mungkin terjadi:
- `DISCONNECTED`: WhatsApp belum terhubung / terputus.
- `QR`: QR code siap untuk di-scan.
- `AUTHENTICATED`: Berhasil scan, sedang memuat sesi.
- `READY`: WhatsApp aktif dan siap digunakan.

---

### 📱 GET `/api/qr`
Mengambil data QR Code aktif dalam format base64 Data URL.

#### Request Headers / Query:
`X-API-Token: [API_TOKEN]` atau via query string `?token=[API_TOKEN]`

#### Example Response:
```json
{
  "success": true,
  "qr": "2@...",
  "qrDataURL": "data:image/png;base64,iVBORw0KGgoAAAAN..."
}
```

---

### 📜 GET `/api/messages`
Mengambil log riwayat pesan masuk dan keluar terbaru.

#### Request Query:
- `limit` (opsional): Jumlah pesan terakhir (default: 50).

#### Example Response:
```json
{
  "success": true,
  "total": 2,
  "messages": [
    {
      "id": "false_6281234567890@c.us_3EB0...",
      "from": "6281234567890@c.us",
      "body": "Halo bot",
      "type": "chat",
      "timestamp": "2026-07-24T11:38:00.000Z",
      "direction": "incoming"
    }
  ]
}
```

---

## 5. Integrasi QR Code via iframe

Untuk menampilkan QR code yang ter-update secara realtime di dalam aplikasi web Anda, gunakan tag `<iframe>` berikut:

```html
<iframe 
    src="http://localhost:3000/qr-view" 
    width="260" 
    height="320" 
    frameborder="0"
    style="border-radius: 12px; overflow: hidden;">
</iframe>
```

---

## 6. WebSocket Realtime (Notifikasi & Status)

Aplikasi menyediakan koneksi WebSocket pada `ws://localhost:3000` untuk menerima event realtime:

### Format Event WebSocket:
```json
{
  "event": "message_received",
  "data": {
    "from": "6281234567890@c.us",
    "body": "Halo!",
    "timestamp": "2026-07-24T11:40:00.000Z"
  },
  "timestamp": "2026-07-24T11:40:00.000Z"
}
```

### Event List:
- `state`: Status awal koneksi saat client terhubung.
- `qr`: Event ketika QR code baru dibuat/diperbarui.
- `authenticated`: Event ketika QR berhasil di-scan.
- `ready`: Event ketika WhatsApp siap digunakan.
- `disconnected`: Event ketika koneksi terputus.
- `message_received`: Event ketika ada pesan masuk dari pengguna.
- `message_sent`: Event ketika ada pesan berhasil terkirim dari API.

---

## 7. Mengaktifkan Kembali Bot Auto-Reply

Fungsi bot auto-reply bawaan tidak dihapus, melainkan dinonaktifkan sementara (di-comment) di dalam file [server.js](file:///persistent/home/Gilang/webjs/server.js).

Untuk mengaktifkannya kembali:
1. Buka file `server.js`.
2. Cari bagian `client.on('message', async (msg) => { ... })`.
3. Hapus tanda komentar `/*` dan `*/` di bagian block bot commands (`!ping`, `!reaction`, `!location`, `!poll`, `!echo`).
4. Simpan file dan restart `server.js`.
