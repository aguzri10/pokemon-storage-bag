# 📖 Dokumentasi Pembelajaran: `src/components/SearchInput.vue`

> **Tujuan**: Memahami *Two-Way Data Binding* modern di Vue 3 menggunakan macro `defineModel()`, perbandingannya dengan `v-model` klasik, serta mental model analogi dengan `TextEditingController` di Flutter.

---

## 📌 1. Gambaran Umum Komponen

Komponen [`src/components/SearchInput.vue`](../src/components/SearchInput.vue) adalah komponen input pencarian teks interaktif yang digunakan pada antarmuka Storage untuk menyaring daftar Pokémon secara *real-time*.

Komponen ini dilengkapi dengan:
- Ikon pencarian ramah aksesibilitas (*A11y*).
- Tombol reset (*clear*) instan dengan kondisional rendering `v-if`.
- Pengikatan data dua arah (*Two-Way Data Binding*) langsung ke variabel induk menggunakan macro modern `defineModel()`.

---

## 🔄 Mental Model: TextEditingController (Flutter) ⇄ defineModel() (Vue 3)

| Fitur / Kebutuhan | Flutter | Vue 3 (Composition API) |
| :--- | :--- | :--- |
| **Penyimpan Nilai Teks** | `TextEditingController searchController = TextEditingController();` | `const searchQuery = ref('');` |
| **Menghubungkan ke Widget** | `CustomSearchField(controller: searchController)` | `<SearchInput v-model="searchQuery" />` |
| **Memantau Perubahan Teks** | `searchController.addListener(() => ...)` atau `onChanged: (val) => ...` | Otomatis tersinkronisasi via reaktivitas `ref`! |
| **Membersihkan Input** | `searchController.clear()` | `searchQuery.value = ''` (atau via tombol clear di komponen) |
| **Dispose Listener** | Wajib `controller.dispose()` di `dispose()` / `onClose()` | Otomatis di-garbage collect tanpa takut memory leak |

---

## 🚀 2. Mengapa Memakai `defineModel()` (Vue 3.4+)?

Sebelum Vue 3.4, implementasi `v-model` pada komponen kustom membutuhkan kombinasi prop dan emit manual:

```javascript
// Cara Lama (Vue 3.3 ke bawah):
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
```

Dengan kehadiran **`defineModel()`** di Vue 3.4+, Vue menyederhanakan deklarasi tersebut menjadi satu baris:

```javascript
// Cara Modern:
const model = defineModel({
  type: String,
  default: '',
})
```

Variabel `model` ini berperan ganda sebagai **`ref` lokal** sekaligus saluran sinkronisasi dua arah dengan `v-model` milik parent component:
1. Saat user mengetik di dalam child, nilai variabel di parent otomatis diperbarui secara *real-time*.
2. Saat tombol `clearSearch()` mengubah `model.value = ''` di child, variabel di parent otomatis langsung ikut ter-reset tanpa perlu menulis emit manual!

---

## 🧩 3. Bedah Script (`<script setup>`)

```vue
<script setup>
const model = defineModel({
  type: String,
  default: '',
})

defineProps({
  placeholder: {
    type: String,
    default: 'Cari Pokémon...',
  },
})

function clearSearch() {
  model.value = ''
}
</script>
```

### Penjelasan Bagian Utama:
1. **`defineModel(...)`**:
   - Mendeklarasikan kontrak two-way data binding bertipe `String` dengan nilai awal string kosong `''`.
2. **`defineProps(...)`**:
   - Mendeklarasikan parameter konfigurasi tampilan. Di sini kita membuat prop `placeholder` yang bersifat opsional dengan nilai bawaan (*default*) `"Cari Pokémon..."`.
3. **`clearSearch()`**:
   - Mengosongkan nilai `model.value = ''`. Reaktivitas Vue akan langsung memperbarui tampilan kotak input sekaligus mengosongkan state di parent.

---

## 🖼️ 4. Bedah Template (`<template>`)

```vue
<template>
  <div class="search-input-wrapper">
    <span class="search-icon" aria-hidden="true">🔍</span>
    <input
      v-model="model"
      type="search"
      class="search-input"
      :placeholder="placeholder"
      aria-label="Cari Pokémon"
    />
    <button
      v-if="model"
      type="button"
      class="clear-button"
      aria-label="Bersihkan pencarian"
      title="Bersihkan pencarian"
      @click="clearSearch"
    >
      ✕
    </button>
  </div>
</template>
```

### Poin Penting:
1. **Aksesibilitas (`aria-hidden="true"` & `aria-label`)**:
   - `aria-hidden="true"` pada ikon kaca pembesar memberi instruksi ke *Screen Reader* (alat tuna netra) untuk mengabaikan emoji dekoratif tersebut.
   - `aria-label="Cari Pokémon"` memberikan label yang jelas bagi pengguna pembaca layar ketika kursor fokus pada kotak input.
2. **Kondisional Rendering `v-if="model"`**:
   - Analogi Flutter: `if (searchController.text.isNotEmpty) ...[ClearButton()]`.
   - String kosong `""` bernilai *falsy*, sehingga tombol `✕` tidak dimuat di DOM saat input kosong. Begitu user mengetik minimal 1 karakter (string berisi = *truthy*), tombol `✕` otomatis muncul.
3. **`type="search"` Semantik**:
   - Menggunakan input semantik HTML standar pencarian sehingga keyboard perangkat seluler otomatis menampilkan tombol aksi "Search".

---

## 🎨 5. Catatan Singkat Styling (`<style scoped>`)

- **Isolasi Gaya (`scoped`)**: Seluruh gaya CSS di file ini hanya berlaku khusus untuk `SearchInput.vue` dan tidak akan bocor ke komponen lain.
- **Trik `pointer-events: none` pada Ikon**:
  - Analogi Flutter: Seperti widget `IgnorePointer`.
  - Jika pengguna mengklik mouse tepat di atas gambar kaca pembesar `🔍`, klik tersebut tembus langsung ke kolom input teks di bawahnya sehingga kursor ketik langsung aktif.
- **Trik Padding Khusus**:
  - Padding kiri diperlebar agar teks yang diketik tidak menimpa ikon kaca pembesar (mirip `prefixIcon` di `InputDecoration` Flutter).
  - Padding kanan diperlebar agar teks panjang tidak tertutup oleh tombol silang (mirip `suffixIcon`).
- **Efek Fokus (`:focus`)**:
  - Memberikan cincin cahaya biru lembut (*focus ring*) saat kolom sedang aktif diketik (mirip `focusedBorder` di Flutter).
- **Reset Silang Bawaan Browser**:
  - Menonaktifkan tombol silang bawaan peramban (`::-webkit-search-cancel-button`) agar tombol silang kustom `✕` tampil seragam dan rapi di semua browser dan sistem operasi.
