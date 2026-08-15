# Menjalankan MyAI Chat

## Prasyarat
- Node.js ^22.19.0 atau >=24
- pnpm 11.7.0

## Install & build
```sh
pnpm install
pnpm run build
```

## Konfigurasi API
```sh
cp .env.example .env
# isi MYAI_API_KEY dan MYAI_BASE_URL
```

- `MYAI_API_KEY` — API key MyAI Nexus dari https://console.myai.nexus
- `MYAI_BASE_URL` — endpoint OpenAI/DeepSeek-compatible (default: `https://api.myai.nexus/v1`)

## Jalankan
```sh
pnpm dsh web
```

Buka http://127.0.0.1:3080

## Lokasi data

MyAI Chat menyimpan datanya di `~/.myai-chat` (terpisah dari `~/.dsh`
milik MyAI Developer / coding tool), jadi sesi, pengaturan, dan kredensial
kedua aplikasi tidak bercampur. Override manual tetap bisa lewat variabel
`DSH_HOME`.

