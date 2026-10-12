# 🗺️ Roadmap Belajar Vue 3: Dari Flutter (GetX) ke Vue 3 Pro (Learn by Building)

> **Pendekatan Belajar**: **"Learn by Building" (Kerjakan Sambil Belajar)**. Setiap tahap langsung memodifikasi atau membuat file nyata aplikasi **Pokémon Storage & Bag** sesuai dengan rubrik penilaian di [AGENTS.md](AGENTS.md).

---

## 🧠 Mental Model: Kamus Istilah Flutter (GetX) ⇄ Vue 3

| Konsep Flutter / GetX | Padanan Vue 3 (Composition API) | Catatan Penting & Analogi |
| :--- | :--- | :--- |
| **Widget** (`StatelessWidget`) | `.vue` Single File Component | Berisi 3 blok: `<template>` (UI/Widget Tree), `<script setup>` (Logika), `<style>` (CSS) |
| `Rx<T>` / `.obs` (contoh: `var count = 0.obs`) | `ref(initialValue)` | Di script dibaca/diubah dengan `.value` (persis seperti `count.value` di GetX!). Di template otomatis unwrapped (tidak butuh `.value`). |
| Getter terhitung di Controller (`bool get isFull => ...`) | `computed(() => ...)` | Otomatis cache dan reaktif jika reactive state yang dibaca di dalamnya berubah. |
| Widget Constructor Parameter | `defineProps<{ pokemon: Object }>()` | Data mengalir dari parent ke child (arah turun / read-only). Child dilarang mutasi props. |
| Callback Function (`VoidCallback onTap`, `Function(T)`) | `defineEmits(['select'])` | Event mengalir dari child ke parent (*Props down, events up*). |
| `onInit()` di `GetxController` / `initState()` | `onMounted(() => ...)` | Lifecycle hook yang dijalankan sekali saat komponen pertama kali dipasang di DOM. |
| Worker GetX (`ever(rxVar, (val) => ...)`) | `watch(target, (newVal) => ...)` | Mengamati perubahan data/route tertentu untuk memicu side-effect. |
| `TextEditingController` | `v-model` / `defineModel()` | Two-way data binding otomatis untuk input text / form. |
| **`GetxController` + `Get.find()`** | **Pinia Store (`usePokemonStore`)** | State management global. Properti observable = `state`, getter = `getters`, method = `actions`. |
| `Get.toNamed('/detail/pikachu')` | `vue-router` (`<RouterLink :to="{ name: 'pokemon-detail', params: { ... } }">`) | Navigasi SPA dengan named route parameter. |

---

## 📋 Checklist Modul & Progress Belajar (Step-by-Step Practical)

### 🚀 Milestone 1: Service API & Global State Pinia
*Fokus: Membangun data layer dan store terpusat sebelum menyentuh antarmuka UI.*
- [x] **1.1 Service Layer (`src/services/pokeapi.js`)**:
  - [x] Implementasi fetch daftar Pokémon (`GET /pokemon?limit=20`) & ekstrak ID dari URL.
  - [x] Implementasi fetch detail Pokémon (`GET /pokemon/{name}`).
  - [x] Pemisahan API logic dari UI (mirip Provider/Service di GetX).
- [x] **1.2 Setup & Arsitektur Pinia Store (`src/stores/pokemon.js`)**:
  - [x] Definisikan `state`: `storage` (array), `bag` (array max 6), `isLoading` (boolean), `error` (string/null).
  - [x] Definisikan `getters`: `isBagFull` (computed getter: `bag.length >= 6`).
  - [x] Definisikan `actions`:
    - `fetchPokemons()` dengan proteksi anti-refetch (mirip guard di GetX: cek jika data sudah ada, jangan fetch ulang).
    - `moveToBag(pokemon)`: Validasi kapasitas bag < 6, pindahkan dari `storage` ke `bag`.
    - `moveToStorage(pokemon)`: Pindahkan dari `bag` kembali ke `storage`.
  - [x] **Aturan Penilaian**: Komponen dilarang memutasi state secara langsung; wajib lewat action.

---

### 🧩 Milestone 2: Komponen Atomic & Alur Data (Props & Emits)
*Fokus: Membangun UI blok terkecil yang reusable dengan prinsip "Props Down, Events Up".*
- [x] **2.1 Komponen Kartu Pokémon (`src/components/PokemonCard.vue`)**:
  - [x] Deklarasi props dengan `defineProps`: `pokemon` (Object), `actionLabel` (String), `actionDisabled` (Boolean).
  - [x] Deklarasi emits dengan `defineEmits`: emit `'action'` saat tombol diklik.
  - [x] Thumbnail sprite Pokémon dinamis berdasarkan ID.
  - [x] Link navigasi ke halaman detail menggunakan named route.
- [x] **2.2 Komponen Pencarian (`src/components/SearchInput.vue`)**:
  - [x] Implementasi modern two-way binding dengan `defineModel()` (alternatif `v-model`).
  - [x] Analogi dengan `TextEditingController` GetX tanpa boilerplate listener.

---

### 🖥️ Milestone 3: Halaman Utama (Storage & Bag View)
*Fokus: Menggabungkan komponen, computed filtering, dan state Pinia di layar.*
- [x] **3.1 Wrapper List Pokémon (`src/components/PokemonList.vue`)**:
  - [x] Menerima list dan konfigurasi aksi.
  - [x] Menampilkan grid responsif dan empty state jika list kosong.
- [x] **3.2 Halaman Utama (`src/views/HomeView.vue`)**:
  - [x] Integrasi `usePokemonStore()`.
  - [x] Menggunakan `onMounted()` untuk trigger `fetchPokemons()` pertama kali.
  - [x] Membuat local state `searchQuery = ref('')`.
  - [x] Membuat `computed(() => ...)` untuk memfilter `storage` berdasarkan pencarian nama Pokémon.
  - [x] Layout 2 kolom berdampingan di Desktop (Storage di kiri, Bag di kanan) dan stacked di Mobile.
  - [x] Menghubungkan event emit kartu ke action store (`moveToBag` & `moveToStorage`).

---

### 🔍 Milestone 4: Routing & Halaman Detail Pokémon
*Fokus: Navigasi SPA, component reuse, dan penanganan lifecycle.*
- [ ] **4.1 Konfigurasi Vue Router (`src/router/index.js`)**:
  - [ ] Named route: `home` (`/`), `pokemon-detail` (`/pokemon/:name`), `not-found` (`/:pathMatch(.*)*`).
- [ ] **4.2 Halaman Detail (`src/views/PokemonDetailView.vue`)**:
  - [ ] Menampilkan artwork resmi, types, height, weight, abilities, dan base stats.
  - [ ] Indikator status lokasi Pokémon: apakah sedang di *Bag* atau di *Storage* (menggunakan `computed`).
  - [ ] Tombol *Previous* dan *Next* Pokémon.
  - [ ] **Kunci Penilaian**: Implementasi `watch(() => route.params.name, ...)` untuk re-fetch data saat berganti Pokémon tanpa unmount komponen.
- [ ] **4.3 Halaman 404 Not Found (`src/views/NotFoundView.vue`)**:
  - [ ] Menampilkan pesan tidak ditemukan dan tombol kembali ke Home.

---

### 🎨 Milestone 5: Polish UX, Handling State, & Simulasi Review
*Fokus: Menguji kelengkapan rubrik, penanganan edge cases, dan pemahaman teknis.*
- [ ] **5.1 Handling State UI Lengkap**:
  - [ ] Loading spinner / skeleton saat API sedang dipanggil.
  - [ ] Error message & tombol coba lagi (Retry).
  - [ ] Empty state ramah pengguna (Storage kosong, Bag kosong, Pencarian tidak ditemukan).
- [ ] **5.2 Verifikasi Aturan Mutlak**:
  - [ ] Kembali dari detail ke Home tidak memicu fetch ulang.
  - [ ] Pindah halaman tidak mereset isi Bag.
  - [ ] Batas maksimal Bag 6 Pokémon tidak bisa ditembus.
- [ ] **5.3 Simulasi Tanya-Jawab Live Review**:
  - [ ] Tanya-jawab konsep Vue 3 vs GetX (Mental model, reactivity, component reuse).
