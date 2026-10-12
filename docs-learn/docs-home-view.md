# 📖 Dokumentasi Pembelajaran: `src/views/HomeView.vue`

> **Tujuan**: Memahami penggabungan state global Pinia, state lokal (`ref`), lifecycle hook `onMounted()`, perbedaan mendalam `ref` vs `computed()`, penanganan multi-state (*Loading, Error, Success*), serta arsitektur antarmuka dua kolom responsif.

---

## 📌 1. Gambaran Umum Tampilan

Halaman [`src/views/HomeView.vue`](../src/views/HomeView.vue) adalah tampilan utama aplikasi **Pokémon Storage & Bag**. Di halaman ini, pengguna dapat:
1. Melihat daftar Pokémon di Storage (kolom kiri) dan Bag (kolom kanan) berdampingan.
2. Melakukan pencarian Pokémon secara instan (*real-time*) di Storage.
3. Memindahkan Pokémon ke Bag dengan batas maksimal 6 ekor.
4. Mengembalikan Pokémon dari Bag ke Storage dalam urutan nomor ID semula.
5. Menangani multi-state secara rapi (*Loading spinner*, *Pesan error + Coba Lagi*, serta *Notifikasi Bag Penuh*).

---

## 🔄 2. Mental Model: GetView & GetX Controller ⇄ Vue 3 Composition API

| Konsep Flutter / GetX | Padanan Vue 3 Composition API | Peran di HomeView |
| :--- | :--- | :--- |
| `controller = Get.find<PokemonController>()` | `const pokemonStore = usePokemonStore()` | Akses state management terpusat (Pinia). |
| `onInit()` di Controller | `onMounted(() => ...)` | Memicu pemanggilan API saat layar pertama kali dimuat. |
| `final searchQuery = ''.obs;` | `const searchQuery = ref('')` | State lokal input pencarian (Data Mentah). |
| `List get filteredList => storage.where(...)` | `const filteredStorage = computed(() => ...)` | Perhitungan reaktif hasil filter pencarian (Data Turunan). |
| `controller.obx(...)` / Status UI | `v-if="store.isLoading"`, `v-else-if="store.error"`, `v-else` | Conditional rendering status loading, error, dan konten sukses. |
| Panggil Method Controller (`controller.moveToBag(p)`) | `pokemonStore.moveToBag(pokemon)` | Mengubah state HANYA melalui action Pinia (aturan mutlak). |

---

## 💡 3. Konsep Inti: `ref()` vs `computed()`

Memahami perbedaan antara `ref()` dan `computed()` adalah kunci fundamental di Vue 3:

| Pembeda | `ref()` | `computed()` |
| :--- | :--- | :--- |
| **Peran** | **Sumber data mentah / primer** (Source of Truth). | **Data turunan** hasil perhitungan dari variabel reaktif lain. |
| **Sifat Nilai** | **Bisa diubah langsung** (Read & Write).<br>`searchQuery.value = 'pika'` | **Read-Only** secara bawaan (Hanya baca).<br>Nilainya ditentukan oleh rumus di dalamnya. |
| **Kapan Berubah?** | Berubah saat **Anda yang mengubahnya secara manual**. | Berubah **otomatis** setiap kali variabel reaktif di dalamnya berubah. |
| **Caching** | Tidak ada caching. | **Memiliki Smart Cache** (hanya menghitung ulang jika ada dependensi yang berubah). |

### Analogi Kasus: Keranjang Belanja
```javascript
const harga = ref(10000) // ref: diinput manual
const jumlah = ref(2)    // ref: diinput manual

// computed: otomatis terhitung 20000. Jika jumlah jadi 3, otomatis jadi 30000!
const total = computed(() => harga.value * jumlah.value)
```

Di `HomeView.vue`, `searchQuery` menggunakan **`ref`** karena diketik oleh user, sedangkan `filteredStorage` menggunakan **`computed`** karena menyaring data `pokemonStore.storage` berdasarkan apa yang ada di `searchQuery`.

---

## 🧩 4. Bedah Script (`<script setup>`)

```vue
<script setup>
import { computed, onMounted, ref } from 'vue'
import PokemonList from '../components/PokemonList.vue'
import SearchInput from '../components/SearchInput.vue'
import { usePokemonStore } from '../stores/pokemon'

const pokemonStore = usePokemonStore()
const searchQuery = ref('')

onMounted(() => {
  pokemonStore.fetchPokemons()
})

const filteredStorage = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return pokemonStore.storage
  }
  return pokemonStore.storage.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(query)
  )
})

const storageEmptyMessage = computed(() => {
  if (searchQuery.value.trim() && pokemonStore.storage.length > 0) {
    return `Tidak ada Pokémon yang cocok dengan "${searchQuery.value}".`
  }
  return 'Storage kosong.'
})

function handleMoveToBag(pokemon) {
  pokemonStore.moveToBag(pokemon)
}

function handleMoveToStorage(pokemon) {
  pokemonStore.moveToStorage(pokemon)
}

function handleRetry() {
  pokemonStore.fetchPokemons()
}
</script>
```

### Penjelasan Kunci:
1. **`onMounted` & Proteksi Re-fetch**:
   - `onMounted` hanya dieksekusi sekali saat komponen dipasang ke DOM.
   - Karena di Pinia store ada guard `if (this.isInitialized ...) return;`, berpindah halaman (misal ke Detail lalu kembali ke Home) tidak memicu request jaringan berulang.
2. **Aturan Mutasi State**:
   - Komponen sama sekali tidak memanggil `store.storage.push()` atau `store.bag.splice()`. Semua mutasi dilakukan via method action Pinia (`moveToBag` dan `moveToStorage`).

---

## 🖼️ 5. Bedah Template & Multi-State Handling

```vue
<template>
  <div class="home-view">
    <!-- 1. Status Loading -->
    <section v-if="pokemonStore.isLoading" class="state-container state-loading">
      <div class="loading-spinner" aria-hidden="true" />
      <p class="state-title">Memuat Pokémon...</p>
      <p class="state-subtitle">Sedang mengambil data 20 Pokémon awal dari PokéAPI.</p>
    </section>

    <!-- 2. Status Error dengan Tombol Retry -->
    <section v-else-if="pokemonStore.error" class="state-container state-error">
      <div class="state-icon" aria-hidden="true">⚠️</div>
      <p class="state-title">Terjadi Kesalahan</p>
      <p class="state-message">{{ pokemonStore.error }}</p>
      <button type="button" class="btn-retry" @click="handleRetry">Coba Lagi</button>
    </section>

    <!-- 3. Status Konten Sukses (2 Kolom) -->
    <div v-else class="home-grid">
      <!-- Kolom Kiri: Storage -->
      <section class="column storage-column">
        <SearchInput v-model="searchQuery" placeholder="Cari Pokémon di Storage..." />
        <PokemonList
          title="Pokémon Storage"
          :pokemons="filteredStorage"
          :badge-count="`${filteredStorage.length} / ${pokemonStore.storageCount}`"
          action-label="Pindahkan ke Bag"
          :action-disabled="pokemonStore.isBagFull"
          :empty-message="storageEmptyMessage"
          @action="handleMoveToBag"
        />
      </section>

      <!-- Kolom Kanan: Bag -->
      <section class="column bag-column">
        <div v-if="pokemonStore.isBagFull" class="bag-full-alert" role="status">
          <span class="alert-icon" aria-hidden="true">⚠️</span>
          <span>Bag penuh (6/6). Kembalikan Pokémon ke Storage untuk menampung lainnya.</span>
        </div>
        <PokemonList
          title="Pokémon Bag"
          :pokemons="pokemonStore.bag"
          :badge-count="`${pokemonStore.bagCount} / 6`"
          action-label="Kembalikan ke Storage"
          :action-disabled="false"
          empty-message="Bag masih kosong (maksimal 6 Pokémon)."
          @action="handleMoveToStorage"
        />
      </section>
    </div>
  </div>
</template>
```

---

## 🎨 6. Bedah Style (`<style scoped>`)

### A. Layout 2 Kolom Asimetris & Responsif
```css
.home-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .home-grid {
    grid-template-columns: 1.15fr 0.85fr;
    gap: 2rem;
  }
}
```
- **Mobile (< 1024px)**: 1 kolom bertumpuk (*stacked*), memudahkan navigasi vertikal di ponsel.
- **Desktop (>= 1024px)**: 2 kolom berdampingan dengan rasio `1.15fr 0.85fr` (Storage lebih lega menampung 20 kartu, Bag lebih ringkas untuk 6 kartu).
- **`align-items: start;`**: Mencegah tinggi kolom Bag dipaksa memanjang menyamai kolom Storage yang jumlah kartunya jauh lebih banyak.

### B. Pure CSS Loading Spinner
```css
.loading-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--color-border, #e2e8f0);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```
* Membuat lingkaran abu-abu dengan busur biru di atasnya, lalu diputar terus-menerus 360° menggunakan CSS `@keyframes`. Sangat ringan dan tidak butuh gambar eksternal.

### C. Flex Shrink pada Ikon Alert
```css
.alert-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}
```
* `flex-shrink: 0` menjamin ikon peringatan tidak akan pernah menciut atau gepeng saat teks peringatan memanjang pada layar sempit.
