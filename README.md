# Pokémon Storage & Bag

Aplikasi web pengelola Pokémon yang dibangun menggunakan **Vue 3 (Composition API)**, **Pinia**, dan **Vue Router**. Aplikasi ini memungkinkan pengguna memindahkan Pokémon antara **Storage** dan **Bag** (maksimal 6 Pokémon), melakukan pencarian, serta melihat detail lengkap setiap Pokémon beserta navigasi antar Pokémon.

Proyek ini dibuat sebagai pemenuhan **Tugas Penilaian Front End: Pokémon Storage & Bag**.

---

## 🚀 Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API dengan `<script setup>`)
- **Build Tool**: [Vite](https://vite.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router 4](https://router.vuejs.org/)
- **HTTP Client**: Native `fetch` API
- **Code Linter & Formatter**: ESLint, Oxlint, Prettier

---

## 🎯 Fitur Aplikasi

### 1. Homepage (`/`)
- **Dua Kolom (Storage & Bag)**: Menampilkan Storage (kiri) dan Bag (kanan) berdampingan pada layar desktop dan responsif pada layar mobile.
- **Data Awal**: Mengambil 20 Pokémon pertama dari PokéAPI saat aplikasi pertama kali dibuka.
- **Pencarian Pokémon**: Filter nama Pokémon di Storage secara *real-time* (case-insensitive).
- **Perpindahan Item**:
  - Pindahkan Pokémon dari Storage ke Bag.
  - Kembalikan Pokémon dari Bag ke Storage pada urutan semula (berdasarkan nomor ID).
  - Satu Pokémon tidak dapat berada di kedua tempat sekaligus atau duplikat.
- **Batas Kapasitas Bag**: Maksimal 6 Pokémon. Tombol pindah dinonaktifkan dan pesan status *"Bag penuh (6/6)"* ditampilkan saat penuh.
- **State Handling**: Menangani status *Loading*, *Error* (disertai tombol *"Coba lagi"*), dan *Empty State* (*"Bag masih kosong"* / *"Pokémon tidak ditemukan"*).
- **Cache / Single Fetch**: Navigasi ke detail dan kembali ke Homepage tidak memicu fetch ulang serta tidak mereset isi Bag.

### 2. Detail Pokémon (`/pokemon/:name`)
- Menampilkan nama (kapital), ID, gambar resmi (*official-artwork* dengan fallback sprite).
- Badge tipe Pokémon (misal: *Grass*, *Poison*).
- Tinggi (meter) dan berat (kilogram) yang sudah dikonversi.
- Daftar *Abilities*.
- Visualisasi *Base Stats* (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed).
- Status lokasi Pokémon saat ini (*"Ada di Bag"* / *"Ada di Storage"*) beserta tombol aksi pemindahan.
- Navigasi **Sebelumnya (ID - 1)** dan **Berikutnya (ID + 1)** langsung di halaman detail.
- Tombol kembali ke Homepage.
- Penanganan rute 404 jika nama Pokémon tidak ditemukan di API.

### 3. Halaman Not Found (`/:pathMatch(.*)*`)
- Menampilkan pesan informasi jika rute yang diakses tidak valid.

---

## 🧩 Penerapan Konsep Inti Vue 3

Proyek ini dirancang untuk mendemonstrasikan konsep fundamental Vue 3 Composition API:
1. **Pinia (`usePokemonStore`)**: Mengelola state global (`storage`, `bag`, `isLoading`, `error`) secara terisolasi tanpa memutasi array state langsung dari komponen.
2. **`ref`**: Mengelola state lokal komponen (seperti input teks pencarian dan data detail Pokémon).
3. **`onMounted`**: Memulai pemanggilan data API saat pertama kali dimuat dengan validasi agar tidak fetch berulang.
4. **`watch`**: Memantau perubahan parameter rute (`route.params.name`) di halaman detail untuk memuat ulang data saat tombol *Sebelumnya/Berikutnya* diklik.
5. **`computed`**: Menghasilkan data turunan yang reaktif (filter pencarian, penghitungan jumlah item, status kapasitas bag).
6. **Event Handling (`defineEmits`)**: Menerapkan arsitektur *"props down, events up"*.
7. **Two-Way Binding (`defineModel` / `v-model`)**: Mengikat nilai input pencarian secara deklaratif.
8. **Reusable Components & Props**: Menggunakan kembali `PokemonCard.vue` dengan validasi tipe props.

---

## 📦 Panduan Instalasi & Menjalankan Proyek

### Prasyarat
- Node.js versi `^22.18.0` atau `>=24.12.0` (disarankan LTS terbaru)
- Package manager: `npm` atau `pnpm`

### 1. Clone & Masuk ke Direktori
```bash
git clone <url-repository>
cd pokemon-storage-bag
```

### 2. Instal Dependensi
```bash
npm install
# atau
pnpm install
```

### 3. Jalankan Server Development
```bash
npm run dev
# atau
pnpm dev
```
Buka browser pada alamat yang tertera (biasanya `http://localhost:5173`).

### 4. Build untuk Production
```bash
npm run build
```

### 5. Menjalankan Linter & Formatter
```bash
npm run lint
npm run format
```

---

## 📌 Asumsi & Keputusan Teknis
1. **Pengurutan Storage**: Saat Pokémon dikembalikan dari Bag ke Storage, posisinya diurutkan kembali berdasarkan nomor `id` agar urutan tetap konsisten.
2. **Single Fetch**: Data daftar Pokémon awal disimpan dalam Pinia store sehingga perpindahan rute tidak membebani network / API.
3. **Named Routes**: Seluruh navigasi internal menggunakan nama rute (`name: 'pokemon-detail'`) untuk menghindari hardcoded path.
