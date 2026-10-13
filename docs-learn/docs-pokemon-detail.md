# 📖 Dokumentasi Pembelajaran: `src/views/PokemonDetailView.vue` & Routing SPA

> **Tujuan**: Memahami Dynamic Routing SPA, Component Reuse vs `watch()`, pengambilan parameter URL (`useRoute`), penanganan lifecycle & Guard Clause, penyajian data API terperinci, sintaks template Vue (`:` vs statis), serta sinkronisasi Derived State (`computed`) dengan Pinia Store.

---

## 📌 1. Gambaran Umum

Halaman [`src/views/PokemonDetailView.vue`](../src/views/PokemonDetailView.vue) menampilkan profil lengkap dari seekor Pokémon berdasarkan parameter dinamis URL (`/pokemon/:name`).

Fitur utama di halaman ini:
1. **Visual & Statistik**: Menampilkan official artwork resolusi tinggi, tipe elemen (dengan badge warna resmi Pokémon), spesifikasi fisik (tinggi & berat), daftar *abilities*, dan *progress bar* visual untuk 6 *Base Stats*.
2. **Sinkronisasi State Global**: Mengetahui secara otomatis apakah Pokémon tersebut sedang berada di **Storage** atau di **Bag**, serta menyediakan tombol untuk memindahkannya langsung dari halaman detail (tetap tunduk pada batas maksimal Bag 6 Pokémon).
3. **Navigasi Berantai (Prev / Next)**: Berpindah langsung ke Pokémon sebelumnya (`ID - 1`) atau berikutnya (`ID + 1`) tanpa perlu kembali ke Homepage.
4. **Resilience / Fallback**: Penanganan loading spinner, pesan error jika Pokémon tidak ditemukan, dan fallback rute 404.

---

## 🔄 2. Mental Model: Flutter (GetX) ⇄ Vue 3 Composition API

| Konsep Flutter / GetX | Padanan Vue 3 Composition API | Peran di Halaman Detail |
| :--- | :--- | :--- |
| `Get.parameters['name']` | `const route = useRoute()`<br>`route.params.name` | Membaca parameter dinamis dari URL aktif. |
| `GetPage(name: '/pokemon/:name')` | `{ path: '/pokemon/:name', name: 'pokemon-detail' }` | Mendaftarkan named route di [`src/router/index.js`](../src/router/index.js). |
| `Get.toNamed('/pokemon/2')` | `<RouterLink :to="{ name: 'pokemon-detail', params: { name: 2 } }">` | Navigasi deklaratif antar Pokémon. |
| `controller.bag.firstWhereOrNull(...)` | `computed(() => store.bag.find(...))` | Status lokasi terhitung otomatis dan reaktif (Derived State). |
| **Worker GetX:**<br>`ever(rxParam, (val) => fetch(val))` | **`watch(() => route.params.name, (newName) => fetch(newName), { immediate: true })`** | **KUNCI KRUSIAL:** Re-fetch data saat parameter URL berganti pada komponen yang sama tanpa unmount. |

---

## 🛡️ 3. Mengapa Ada `pokemonStore.fetchPokemons()` di `onMounted()`?

Mungkin timbul pertanyaan: *"Ini halaman detail, kenapa memanggil fetch list Pokémon 20 awal di `onMounted()`? Apakah tidak boros kuota/network?"*

### A. Skenario Direct Link / Page Refresh
Bayangkan jika user **TIDAK** membuka web dari Homepage (`/`), melainkan **langsung mengetik URL atau me-refresh browser (F5)** di alamat:
`http://localhost:5173/pokemon/bulbasaur`

- Tanpa pemanggilan ini, store Pinia (`storage` dan `bag`) masih kosong melompong (`[]`).
- Akibatnya, `computed` kita (`pokemonInStorage` & `pokemonInBag`) akan mengira Bulbasaur berada di *"Luar Storage & Bag"*, dan tombol *"Pindahkan ke Bag"* tidak akan muncul.
- Dengan memanggil `pokemonStore.fetchPokemons()`, kita memastikan data Storage selalu siap di mana pun user masuk ke aplikasi.

### B. Mengapa SAMA SEKALI TIDAK BOROS?
Karena di dalam store Pinia ([`src/stores/pokemon.js`](../src/stores/pokemon.js)), kita sudah memasang **Guard Clause**:
```javascript
async fetchPokemons() {
  // GUARD: Jika sudah pernah di-fetch atau sudah ada isinya, LANGSUNG BERHENTI!
  if (this.isInitialized || this.storage.length > 0 || this.bag.length > 0) {
    return
  }
  ...
}
```
- **Alur Normal (dari Home ke Detail)**: Di Home sudah fetch 1x. Saat pindah ke Detail, `onMounted` memanggil `fetchPokemons()` ➔ dicegat oleh Guard ➔ **0 request ke API (0 KB)**.
- **Alur Refresh**: Store kosong ➔ fetch 1x untuk mengisi Storage.

---

## ⚡ 4. Alur Asinkron `loadPokemon()` & Error Handling

```javascript
async function loadPokemon(nameOrId) {
  isLoading.value = true
  error.value = null

  try {
    const data = await getPokemonDetail(nameOrId)
    pokemon.value = data
  } catch (err) {
    error.value = err.message || 'Gagal memuat detail Pokémon.'
    pokemon.value = null
  } finally {
    isLoading.value = false
  }
}
```

1. **Reset State Awal**: `isLoading.value = true` dan `error.value = null` membersihkan status lama sebelum mulai mengambil data.
2. **`try`**: Memanggil service API `getPokemonDetail(nameOrId)`. Jika sukses, disimpan ke state lokal `pokemon.value`.
3. **`catch`**: Menangkap kegagalan jaringan atau respons 404 dari API, mengisi pesan error ramah pengguna, dan mengosongkan data Pokémon.
4. **`finally` (Paling Krusial)**: Baik request berhasil maupun gagal, `isLoading.value = false` wajib dieksekusi agar animasi loading tidak macet (*stuck*) selamanya.

---

## ⚠️ 5. Bedah Mendalam `watch()` & Fenomena "Component Reuse"

Ini perbedaan arsitektural terbesar antara navigasi mobile (Flutter) dan web SPA (Vue):

### A. Kasus di Flutter:
Ketika kamu memanggil `Get.toNamed('/pokemon/charmander')` dari halaman `bulbasaur`, Flutter membuat **instance Widget baru** dan menumpuknya di atas Navigation Stack. Lifecycle `initState()` / `onInit()` otomatis dieksekusi dari awal.

### B. Kasus di Vue Router (SPA):
Ketika kamu berada di `/pokemon/1` lalu menekan tombol Next ke `/pokemon/2`:
- Vue Router melihat bahwa target rute menggunakan komponen yang sama: `PokemonDetailView`.
- Untuk menghemat memori dan rendering cepat, Vue **TIDAK MENGHANCURKAN (unmount)** komponen lama. Komponen tersebut **di-reuse (dipakai ulang)**.
- **Dampaknya:** Lifecycle `onMounted()` **TIDAK AKAN DIJALANKAN LAGI** saat kamu berpindah Pokémon via Prev/Next!

### C. Solusi Elegan:
```javascript
watch(
  () => route.params.name,
  (newName) => {
    if (newName) {
      loadPokemon(newName)
    }
  },
  { immediate: true }
)
```

1. **Target Getter `() => route.params.name`**:
   Dibungkus arrow function agar Vue memantau properti dinamis di dalam objek reaktif `route.params`, bukan sekadar teks mati.
2. **Opsi `{ immediate: true }`**:
   Memerintahkan Vue untuk langsung mengeksekusi callback saat komponen pertama kali dibuat. Dengan trik ini, kita tidak perlu lagi menduplikasi pemanggilan `loadPokemon()` di dalam `onMounted()`.
3. **Pengecekan `if (newName)` (Truthy vs Falsy)**:
   - Di Dart/Flutter, kondisi `if` wajib boolean (`bool`). Di JavaScript, ada konsep **Truthy/Falsy**: string yang ada isinya dianggap `true`, sedangkan `null`/`undefined`/`""` dianggap `false`.
   - `if (newName)` bertindak sebagai **Satpam (Guard)**: mencegah aplikasi menembak API ke `/pokemon/undefined` saat URL sedang dalam fase transisi rute.
4. **Mengapa tidak perlu `if (newName !== oldName)`?**
   Karena fungsi `watch` di Vue **sudah secara otomatis** mengecek apakah nilai baru berbeda dari nilai lama sebelum menjalankan callback.

---

## 🧩 6. Derived State (`computed`) Lokasi & Tombol Pindah

```javascript
const pokemonInBag = computed(() => {
  if (!pokemon.value) return null
  return pokemonStore.bag.find(
    (item) => item.id === pokemon.value.id || item.name.toLowerCase() === pokemon.value.name.toLowerCase()
  )
})
```

### A. Mengapa Memakai `.find()` (Objek), Bukan `.some()` (Boolean)?
- `.find()` mengembalikan **data objek Pokémon lengkap** dari array store (`{ id, name, url, sprite }`), atau `undefined` jika tidak ada.
- **Strategi Efisiensi**:
  1. Untuk kondisi: Objek adalah *Truthy*, sedangkan `undefined`/`null` adalah *Falsy*. Jadi `if (pokemonInBag.value)` otomatis bekerja seperti boolean!
  2. Untuk aksi: Saat tombol ditekan, kita tinggal melempar `pokemonInBag.value` ke action Pinia `store.moveToStorage(pokemonInBag.value)` tanpa perlu mencari ulang ke store!

### B. Aturan Tombol di `locationInfo`:
1. **Saat Pokémon ada di Bag**:
   - `buttonLabel: 'Kembalikan ke Storage'`
   - `buttonDisabled: false` ➔ Tombol **selalu aktif (bisa diklik)** karena Pokémon di Bag bebas dikembalikan kapan saja tanpa batasan.
2. **Saat Pokémon ada di Storage**:
   - `buttonLabel`: Jika `pokemonStore.isBagFull` bernilai `true`, teks berubah menjadi `'Bag Penuh (6/6)'`.
   - `buttonDisabled: pokemonStore.isBagFull` ➔ Tombol **nonaktif (disabled)** saat Bag sudah mencapai kapasitas 6 Pokémon.
3. **Saat Pokémon di luar Storage & Bag (`outside`)**:
   - *Defensive Programming*: Jika user membuka Pokémon dengan ID di atas 20 (misal `/pokemon/pikachu` #25), aplikasi tetap aman dan tidak crash.

---

## 🔢 7. Logika Navigasi Prev (`prevId`) & Next (`nextId`)

```javascript
const prevId = computed(() => (pokemon.value && pokemon.value.id > 1 ? pokemon.value.id - 1 : null))
const nextId = computed(() => (pokemon.value ? pokemon.value.id + 1 : null))
```

- **`id > 1`**: Bulbasaur adalah Pokémon nomor #1 di Pokédex. Tidak ada Pokémon dengan nomor `0` atau minus. Jadi saat berada di ID 1, `prevId` menghasilkan `null`.
- Di template:
  - `v-if="prevId"` ➔ Merender `<RouterLink>` aktif.
  - `v-else` ➔ Merender `<span>` nonaktif dengan class `.nav-btn--disabled` (`cursor: not-allowed`).

---

## 🎨 8. Desain Visual: `typeColors` & Rasionalisasi Skala Stat 150

### A. `typeColors` & `getTypeColor(typeName)`
- Berisi pemetaan 18 tipe resmi Pokémon (*fire, water, grass, electric, poison, psychic, dll*) ke palet warna modern.
- Menggunakan fallback `|| '#6b7280'` agar jika ada tipe baru/tak dikenal, badge tetap memiliki warna abu-abu netral dan tidak menghasilkan background transparan yang rusak.

### B. Rasionalisasi Pembagi Skala 150 pada `getStatPercentage`
```javascript
function getStatPercentage(val) {
  return Math.min(100, Math.round((val / 150) * 100))
}
```
**Mengapa pembaginya 150, bukan batas maksimal mutlak game 255?**
- **Masalah jika 255**: Di game Pokémon, stat maksimal mutlak adalah 255 (HP Blissey). Namun, 95% Pokémon memiliki stat rata-rata antara 40 s.d. 100. Jika pembaginya 255, maka HP Bulbasaur (45) hanya terisi **17%**! Akibatnya, hampir semua Pokémon barnya akan terlihat sangat pendek, kosong, dan loyo.
- **Alasan 150 (Sweet Spot UX)**: Komunitas Pokémon (seperti Bulbapedia, Smogon, Pokémon Showdown) menggunakan benchmark 150 karena stat 50 terlihat proporsional (33% - tier awal), stat 100 terlihat matang (66% - tier tinggi), dan stat 130-150 terlihat god-tier.
- **`Math.min(100, ...)`**: Bertindak sebagai plafon (cap) agar Pokémon spesial dengan stat > 150 (seperti Blissey) lebarnya tetap terkunci rapi di 100% dan tidak meluber keluar kotak.

---

## 🏷️ 9. Sintaks Template Vue 3: `class` Statis vs `:class` Dinamis

Tanda titik dua `:` adalah singkatan dari directive resmi Vue: **`v-bind:`**.

> **Prinsip Emas Template Vue**:
> - **Tanpa `:`** ➔ Teks mati / string HTML statis.
> - **Pakai `:`** ➔ Dihitung sebagai **kode / variabel JavaScript**!

### Fitur "Class Merging" Otomatis:
```html
<button
  class="btn-action"
  :class="{ 'btn-action--disabled': locationInfo.buttonDisabled }"
>
```
Vue secara otomatis menggabungkan keduanya:
- `class="btn-action"`: Mengatur bentuk dasar tombol yang **selalu ada**.
- `:class="{ 'btn-action--disabled': ... }"`: Hanya ditempelkan jika variabel boolean di dalamnya bernilai `true`.

### 3 Rumus Sakti Template Vue:
1. **`{{ ... }}`** (Mustache): Menampilkan teks JavaScript di dalam tag HTML (`<h1>{{ pokemon.name }}</h1>`).
2. **`:`** (`v-bind`): Mengikat atribut HTML dengan kode/variabel JavaScript (`:src="pokemon.artwork"`, `:disabled="isBagFull"`).
3. **`@`** (`v-on`): Menangkap event browser ke fungsi JavaScript (`@click="handleAction"`).

---

## 🖌️ 10. Arsitektur Styling `<style scoped>` & Responsif

1. **Scoped CSS**: Mengisolasi semua class agar tidak bocor ke luar komponen.
2. **CSS Variables (Design Tokens)**: Menggunakan variabel seperti `var(--color-background-soft, #ffffff)` yang siap mendukung tema Dark Mode secara otomatis.
3. **Mobile-First Responsive**:
   - Di mobile: Header, banner lokasi, dan detail grid disusun 1 kolom bertumpuk vertikal.
   - Di desktop (`@media (min-width: 768px)`): Grid otomatis terbagi menjadi 2 kolom seimbang (kiri: visual & fisik, kanan: base stats).
4. **Mikro-Interaksi**: Animasi putar `@keyframes spin` untuk loading spinner, dan `transition: width 0.4s ease-out` agar bar stat bergerak mulus saat berganti Pokémon.
