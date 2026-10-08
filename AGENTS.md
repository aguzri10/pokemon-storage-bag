# AGENTS.md - Pokémon Storage & Bag Project Guide

Panduan ini berisi aturan, batasan arsitektur, dan spesifikasi teknis untuk pengembangan aplikasi **Pokémon Storage & Bag**. Setiap agen/AI dan pengembang harus mematuhi aturan ini agar sesuai dengan rubrik penilaian teknis.

---

## 1. Ringkasan Proyek
Aplikasi web berbasis **Vue 3** untuk mengelola Pokémon:
- Memindahkan Pokémon antara **Storage** dan **Bag** (maksimal 6 Pokémon di dalam Bag).
- Pencarian Pokémon di Storage.
- Melihat detail setiap Pokémon serta navigasi Pokémon sebelumnya/berikutnya (*Prev/Next*).

---

## 2. Aturan Mutlak & Batasan Teknis (Strict Rules)

> [!CAUTION]
> Pelanggaran terhadap aturan di bawah ini akan langsung mengurangi nilai penilaian!

1. **Wajib Composition API (`<script setup>`)**:
   - Dilarang keras menggunakan **Options API**.
2. **Aturan Mutasi State Pinia**:
   - Komponen **dilarang mengubah state/array store secara langsung** (misal: `store.bag.push(...)` atau `store.storage.splice(...)`).
   - Semua manipulasi state **wajib melalui actions di Pinia** (`moveToBag`, `moveToStorage`, `fetchPokemons`).
3. **Aturan Fetch Data Awal**:
   - Fetch daftar 20 Pokémon awal hanya dilakukan **satu kali** saat aplikasi dibuka.
   - Berpindah dari halaman detail kembali ke Homepage **tidak boleh memicu fetch ulang** dan **tidak boleh mereset isi Bag**.
4. **Alur Data Komponen**:
   - Gunakan prinsip **"Props down, events up"**.
   - Komponen anak wajib memakai `defineEmits` untuk memberi tahu komponen induk saat tombol diklik.
   - Komponen anak dilarang memutasi props secara langsung.
5. **Data Turunan (Derived State)**:
   - Wajib menggunakan `computed` untuk filter pencarian, penghitungan jumlah item, status `isBagFull`, dan status lokasi di detail. Dilarang menyimpan data turunan di `ref` manual yang disinkronkan manual.
6. **Navigasi & Routing**:
   - Navigasi ke detail wajib memakai `<RouterLink :to="{ name: 'pokemon-detail', params: { name: ... } }">` (Named routes), bukan merakit URL string secara manual.
   - Di halaman detail, wajib menggunakan `watch(() => route.params.name, ...)` agar saat tombol *Sebelumnya / Berikutnya* ditekan, data detail otomatis diperbarui (karena komponen yang sama digunakan ulang oleh router).

---

## 3. Checklist Konsep Vue 3 yang Wajib Diimplementasikan

| Konsep | Lokasi Penggunaan Wajib | Poin Penilaian |
| :--- | :--- | :--- |
| **Pinia Store** | `src/stores/pokemon.js` (`storage`, `bag`, `isLoading`, `error`, actions `fetchPokemons`, `moveToBag`, `moveToStorage`, getter `isBagFull`) | Komponen tidak mutasi state langsung, semua lewat action |
| **`ref`** | State lokal komponen (input pencarian, data detail Pokemon) | Membedakan state lokal vs state global |
| **`onMounted`** | Fetch daftar Pokemon di Homepage | Pengecekan agar tidak re-fetch jika store sudah terisi |
| **`watch`** | Halaman detail memantau `route.params.name` | Memahami reuse komponen oleh Vue Router |
| **`computed`** | Filter list storage, jumlah item list, `isBagFull`, label status lokasi | Menghindari duplikasi state di `ref` |
| **Event Handling (`defineEmits`)** | Komponen anak (`PokemonCard.vue`) ke komponen induk | Alur data bersih: props turun, event naik |
| **Two-way Binding (`defineModel` / `v-model`)** | Komponen input pencarian (`SearchInput.vue`) | Pemahaman two-way data binding modern Vue 3 |
| **Component Props** | `PokemonCard.vue` dipakai ulang di Storage & Bag | Reusable component dengan validasi props type |

---

## 4. Arsitektur Struktur Folder

```text
src/
├── assets/             # File CSS (main.css, base.css) dan aset statis
├── components/         # Komponen reusable
│   ├── PokemonCard.vue # Kartu pokemon (dipakai di Storage & Bag)
│   ├── PokemonList.vue # Wrapper list untuk Storage & Bag
│   └── SearchInput.vue # Komponen input pencarian (v-model / defineModel)
├── services/           # Logika pemanggilan HTTP / API
│   └── pokeapi.js      # Wrapper fetch PokeAPI
├── stores/             # State management Pinia
│   └── pokemon.js      # usePokemonStore
├── views/              # Halaman tingkat rute
│   ├── HomeView.vue           # Homepage (Storage & Bag berdampingan)
│   ├── PokemonDetailView.vue   # Halaman detail pokemon
│   └── NotFoundView.vue       # Halaman 404
├── router/
│   └── index.js        # Konfigurasi Vue Router (named routes)
├── App.vue             # Root component
└── main.js             # Entry point
```

---

## 5. Spesifikasi API (Base URL: `https://pokeapi.co/api/v2`)

* **Daftar Pokémon**: `GET /pokemon?limit=20&offset=0`
  * Respons hanya berisi `name` dan `url`.
  * ID Pokémon diekstrak dari akhir URL (misal: `.../pokemon/1/` -> ID = 1).
* **Detail Pokémon**: `GET /pokemon/{name}`
  * Gambar: `sprites.other['official-artwork'].front_default` (fallback: `sprites.front_default`).
  * Type: badge tipe Pokémon.
  * Tinggi: `height / 10` meter.
  * Berat: `weight / 10` kg.
  * Abilities: daftar kemampuan.
  * Base stats: `hp`, `attack`, `defense`, `special-attack`, `special-defense`, `speed`.
* **Sprite Cepat (Homepage)**:
  * `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`
