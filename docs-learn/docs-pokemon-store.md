# 📖 Dokumentasi Pembelajaran: `src/stores/pokemon.js` (Pinia Store)

> **Tujuan**: Memahami manajemen state global menggunakan **Pinia** di Vue 3 dan menyelaraskannya dengan mental model **GetxController** di Flutter (GetX).

---

## 📌 1. Gambaran Umum Pinia Store

File [`src/stores/pokemon.js`](../src/stores/pokemon.js) adalah **pusat penyimpanan data global (Single Source of Truth)** untuk inventori Pokémon. Di sini data `storage` (gudang) dan `bag` (tas) dikelola agar dapat diakses dari halaman mana saja (Homepage maupun Detail Page).

### 🔄 Mental Model: GetxController ⇄ Pinia Store

| Konsep GetX (Flutter) | Konsep Pinia (Vue 3) | Keterangan & Peran |
| :--- | :--- | :--- |
| `class PokemonController extends GetxController` | `defineStore('pokemon', { ... })` | Mendefinisikan wadah state management. |
| `Get.find<PokemonController>()` | `const store = usePokemonStore()` | Mengambil instance store di komponen UI. |
| Variabel `.obs` (data mentah) | `state: () => ({ ... })` | Variabel yang reaktif terhadap perubahan data. |
| Getter kalkulasi (`bool get isBagFull => ...`) | `getters: { ... }` | Data turunan yang otomatis di-cache dan reaktif. |
| Method di controller (`void moveToBag()`) | `actions: { ... }` | Fungsi resmi untuk mutasi state & proses asynchronous. |

---

## 🏗️ 2. Anatomi Struktur Store Pinia

Sebuah Store di Pinia terdiri dari 3 bagian baku utama:

```javascript
export const usePokemonStore = defineStore('pokemon', {
  state: () => ({ ... }),   // 1. Data mentah (State)
  getters: { ... },          // 2. Data turunan (Getters)
  actions: { ... },          // 3. Logika bisnis & Mutasi (Actions)
});
```

- **`defineStore('pokemon', ...)`**: Fungsi bawaan Pinia. String `'pokemon'` adalah **ID unik** store agar tidak bentrok dengan store lain dan mudah dilacak di *Vue Devtools*.
- **Konvensi Nama `usePokemonStore`**: Dimulai dengan kata `use...` sebagai standar *composable function* di Vue 3.

---

## 📦 3. Bedah Bagian `state`

```javascript
state: () => ({
  storage: [],          // Daftar Pokémon yang ada di gudang
  bag: [],              // Daftar Pokémon yang ada di tas (maksimal 6)
  isLoading: false,     // Status loading pemanggilan API
  error: null,          // Pesan kesalahan jika terjadi kegagalan
  isInitialized: false, // Flag proteksi: menandai apakah data awal sudah pernah diambil
}),
```

### Karakteristik Penting:
1. **Otomatis Reaktif**: Semua variabel di dalam `state` otomatis diawasi oleh Vue (seperti `.obs` di GetX). Jika nilainya berubah, tampilan UI yang memakainya otomatis me-render ulang.
2. **Kenapa berbentuk fungsi `() => ({ ... })`?**: Agar setiap kali store dibuat, ia mengembalikan objek baru yang bersih dan terisolasi, mencegah kebocoran data (*data pollution*) terutama pada arsitektur SSR.

---

## 🧮 4. Bedah Bagian `getters`

```javascript
getters: {
  isBagFull: (state) => state.bag.length >= 6,
  storageCount: (state) => state.storage.length,
  bagCount: (state) => state.bag.length,
},
```

### Apa Bedanya dengan `state`?
- **`state`** adalah **Bahan Mentah** (misal: array `bag`).
- **`getters`** adalah **Masakan Jadi / Kalkulasi Otomatis** (misal: apakah tas sudah penuh? berapa jumlah tas?).

### Keunggulan `getters`:
- **Auto Cache (Cerdas)**: Nilai `isBagFull` hanya dihitung ulang jika array `bag` mengalami perubahan. Jika dibaca 10 kali di UI tanpa ada perubahan data, Pinia mengambil dari cache memori, membuat aplikasi sangat cepat.
- **Mencegah Desinkronisasi Data**: Kita tidak perlu membuat `isBagFull` sebagai variabel state manual yang rawan lupa di-update.

---

## ⚡ 5. Bedah Bagian `actions`

`actions` adalah gerbang resmi satu pintu untuk menjalankan proses asynchronous (API) dan mengubah nilai `state`.

> [!CAUTION]
> **Aturan Mutlak Rubrik Penilaian**:
> Komponen UI dilarang memanipulasi array store secara langsung (misal: `store.bag.push(...)` di komponen). Semua perubahan data **wajib melalui `actions`**.

---

### A. Action: `fetchPokemons()`
Mengambil 20 Pokémon awal dari API PokéAPI.

```javascript
async fetchPokemons() {
  // 1. Guard Clause: Mencegah API terpanggil ulang
  if (this.isInitialized || this.storage.length > 0 || this.bag.length > 0) {
    return;
  }

  this.isLoading = true;
  this.error = null;

  try {
    const pokemons = await getPokemonList();
    this.storage = pokemons;
    this.isInitialized = true;
  } catch (err) {
    this.error = err.message || 'Gagal memuat Pokémon. Silakan coba lagi.';
  } finally {
    this.isLoading = false;
  }
}
```

- **Guard Clause**: Memenuhi aturan penilaian [AGENTS.md](../AGENTS.md): Fetch hanya boleh berjalan **1 kali**. Ketika user pindah dari Detail Page kembali ke Homepage, data tidak di-fetch ulang dan isi Bag tidak ter-reset.
- **`this`**: Di dalam actions, kata kunci `this` digunakan untuk mengakses state dan getters (misal: `this.storage`, `this.isLoading`).
- **Error Handling (`try - catch - finally`)**:
  - `try`: Menjalankan request ke server.
  - `catch`: Menangkap error jaringan/server agar aplikasi tidak crash dan menyimpan pesan ke `this.error`.
  - `finally`: Selalu dieksekusi di akhir untuk mematikan loading (`this.isLoading = false`).

---

### B. Action: `moveToBag(pokemon)`
Memindahkan Pokémon dari gudang ke dalam tas.

```javascript
moveToBag(pokemon) {
  // 1. Validasi kapasitas tas
  if (this.isBagFull) {
    return { success: false, message: 'Bag sudah penuh! Maksimal 6 Pokémon.' };
  }

  // 2. Hapus dari storage (Immutability pattern dengan filter)
  this.storage = this.storage.filter((p) => p.id !== pokemon.id);

  // 3. Masukkan ke bag
  this.bag.push(pokemon);

  return { success: true };
}
```

- **Filter**: Membuat list baru berisi semua Pokémon kecuali yang ID-nya sama dengan Pokémon yang dipindahkan.
- **Return Object `{ success, message }`**: Mengembalikan objek informatif sehingga jika operasi gagal (karena tas penuh), komponen UI dapat menampilkan pesan yang jelas (misal via alert/toast) kepada pengguna.

---

### C. Action: `moveToStorage(pokemon)`
Mengeluarkan Pokémon dari tas dan mengembalikannya ke gudang.

```javascript
moveToStorage(pokemon) {
  // 1. Hapus dari bag
  this.bag = this.bag.filter((p) => p.id !== pokemon.id);

  // 2. Kembalikan ke storage
  this.storage.push(pokemon);

  // 3. Rapikan urutan berdasarkan ID
  this.storage.sort((a, b) => a.id - b.id);

  return { success: true };
}
```

- **Sorting (`this.storage.sort((a, b) => a.id - b.id)`)**: Memastikan urutan Pokémon di gudang tetap rapi sesuai nomor ID (1, 2, 3, ...), tidak berantakan setelah dikembalikan dari tas.
