# 📖 Dokumentasi Pembelajaran: `src/components/PokemonCard.vue`

> **Tujuan**: Memahami pembuatan komponen atomic yang dapat dipakai ulang (*reusable*), prinsip **"Props down, events up"**, pemanfaatan `defineProps`, `defineEmits`, tautan navigasi named route, hingga rahasia tata letak CSS Flexbox di Vue 3 dengan analogi Flutter (Widget, Callback, & Layout).

---

## 📌 1. Gambaran Umum Komponen

Komponen [`src/components/PokemonCard.vue`](../src/components/PokemonCard.vue) adalah **komponen kartu tunggal** yang menampilkan informasi ringkas satu Pokémon (ID, nama, sprite thumbnail) dan satu tombol aksi.

Komponen ini dirancang agar bersifat **agnostik** (bisa dipakai di daftar Storage maupun di daftar Bag):
- Di **Storage**: tombol aksi berlabel *"Pindahkan ke Bag"*, dan tombol dinonaktifkan jika Bag sudah penuh.
- Di **Bag**: tombol aksi berlabel *"Kembalikan ke Storage"*.

---

## 🔄 Mental Model: Widget Flutter ⇄ Komponen Vue 3

| Konsep Flutter | Konsep Vue 3 Composition API | Keterangan & Peran |
| :--- | :--- | :--- |
| **`StatelessWidget` / Custom Widget** | File `.vue` SFC (`<script setup>`) | Satuan terkecil antarmuka UI. |
| **Constructor Parameters** (`final Pokemon pokemon`, dll.) | `defineProps({ ... })` | Menerima data dari parent widget (arah turun). |
| **Callback Event** (`final VoidCallback onAction`) | `defineEmits(['action'])` | Memberi sinyal ke parent bahwa aksi telah dipicu (arah naik). |
| **`Widget build(BuildContext context)`** | Blok `<template>` | Tempat menyusun pohon tampilan (Widget Tree). |
| **`Get.toNamed('/detail/...')`** | `<RouterLink :to="{ name: 'pokemon-detail', params: { ... } }">` | Navigasi SPA dengan parameter named route. |
| **`Column(mainAxisAlignment: MainAxisAlignment.spaceBetween)`** | `display: flex; flex-direction: column; justify-content: space-between;` | Mengunci posisi vertikal (atas dan bawah). |
| **`WidgetStateProperty` / `MaterialStateProperty`** | Pseudo-classes CSS (`:hover`, `:active`, `:disabled`) | Mengatur respon tampilan terhadap interaksi pengguna. |

---

## 🏗️ 2. Konsep Inti: "Props Down, Events Up"

Salah satu aturan mutlak di Vue (dan rubrik penilaian teknis):
> **Komponen anak dilarang mengubah data/state milik komponen induk secara langsung.**

```text
       Parent (PokemonList / HomeView)
          │                      ▲
          │ [props: pokemon,     │ [emit: 'action']
          │  actionLabel, ...]   │
          ▼                      │
       Child (PokemonCard.vue)
```

1. **Props Down**: Komponen induk menurunkan data yang dibutuhkan melalui properti (`defineProps`). Komponen anak hanya membaca data ini (*read-only*).
2. **Events Up**: Ketika tombol ditekan oleh pengguna, kartu tidak memodifikasi store langsung, melainkan **memicu event emit** (`defineEmits`) agar induk yang memutuskan logika selanjutnya (misalnya memanggil `store.moveToBag(pokemon)`).

---

## 🧩 3. Bedah Script (`<script setup>`)

```vue
<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
  actionLabel: {
    type: String,
    required: true,
  },
  actionDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['action'])

function handleAction() {
  emit('action')
}
</script>
```

### A. Mengapa Memakai `<script setup>`?
- `<script setup>` adalah format modern Vue 3 yang menghilangkan kebutuhan menulis `export default` dan `return { ... }`.
- Semua variabel `const`, fungsi `function`, dan modul yang di-`import` pada baris atas **otomatis langsung dapat diakses oleh `<template>`**.
- Analogi Flutter: Seperti class `StatelessWidget` di mana properti dan method internal class langsung bisa dipanggil di dalam method `build()`.

### B. `defineProps`: `required` vs `default`
- **`required: true`**: Menandai properti yang **wajib dikirim oleh parent**. Jika parent lupa mengirimnya, Vue akan memunculkan peringatan (*warning*) di console browser.
  - Setara dengan kata kunci `required this.pokemon` pada constructor Flutter.
- **`default: ...`**: Menandai properti yang bersifat **opsional**. Jika parent tidak mengirim nilai, Vue otomatis memakai nilai bawaan ini.
  - Setara dengan `this.actionDisabled = false` pada constructor Flutter.
- **Aturan logis**: Properti yang sudah `required` tidak butuh `default`. Sebaliknya, properti dengan `default` tidak perlu ditandai `required`.

### C. `defineEmits` & `handleAction`
- **`defineEmits(['action'])`**: Mendaftarkan custom event yang dapat dipancarkan oleh komponen anak ke komponen induk. Setara dengan parameter callback `VoidCallback onAction` di Flutter.
- **`emit('action')`**: Fungsi untuk menembakkan event tersebut ke atas.
- **`handleAction()`**: Fungsi penengah yang dipicu saat tombol diklik. Di dalam fungsi ini kita memanggil `emit('action')`. Komponen parent nantinya mendengarkan event ini melalui `@action="handlerParent"`.

---

## 🖼️ 4. Bedah Template (`<template>`)

```vue
<template>
  <div class="pokemon-card">
    <RouterLink
      :to="{ name: 'pokemon-detail', params: { name: pokemon.name } }"
      class="card-link"
      :title="`Lihat detail ${pokemon.name}`"
    >
      <div class="sprite-container">
        <img
          :src="pokemon.sprite"
          :alt="pokemon.name"
          class="pokemon-sprite"
          loading="lazy"
        />
      </div>
      <div class="pokemon-info">
        <span class="pokemon-id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
        <h3 class="pokemon-name">{{ pokemon.name }}</h3>
      </div>
    </RouterLink>

    <div class="card-actions">
      <button
        type="button"
        class="action-button"
        :class="{ 'action-button--disabled': actionDisabled }"
        :disabled="actionDisabled"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>
```

### Poin-Poin Penting:
1. **Kenapa Ada Tag `<template>`?**:
   - Blok `<template>` adalah padanan dari method `Widget build(BuildContext context)` di Flutter. Di sinilah pohon tampilan UI (Virtual DOM) disusun secara deklaratif.
2. **Named Route Navigation (`<RouterLink :to="{ ... }">`)**:
   - Memakai `:to="{ name: 'pokemon-detail', params: { name: pokemon.name } }"` bukan URL string manual (`/pokemon/pikachu`). Ini memastikan aplikasi tahan terhadap perubahan path URL di masa mendatang.
3. **Optimasi Viewport (`loading="lazy"`)**:
   - Mirip dengan `ListView.builder` di Flutter yang hanya merakit widget di layar, atribut `loading="lazy"` menginstruksikan browser untuk **menunda download gambar** hingga kartu mendekati area pandang layar pengguna (*viewport*).
4. **Format 3 Digit Pokédex (`padStart(3, '0')`)**:
   - `String(pokemon.id).padStart(3, '0')` adalah best practice UX visual untuk memastikan angka selalu berformat 3 digit (`#001`, `#025`), sesuai estetika Pokédex resmi.
5. **Dynamic Class & Attribute Binding**:
   - `:disabled="actionDisabled"` mematikan tombol secara native di HTML saat kondisi terpenuhi (misal Bag penuh 6/6).
   - `:class="{ 'action-button--disabled': actionDisabled }"` menempelkan class CSS abu-abu secara kondisional.

---

## 🎨 5. Bedah Style (`<style scoped>`) & Rahasia Flexbox

```css
<style scoped>
.pokemon-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 1rem;
}
...
</style>
```

### A. Fitur Isolasi Gaya (`scoped`)
- Kata kunci `scoped` memastikan CSS di dalam file ini diisolasi dan **hanya berlaku untuk komponen ini saja**.
- Vue secara otomatis menyisipkan atribut ID unik (seperti `data-v-xxxx`) ke elemen kartu saat build, mencegah kebocoran gaya (*style leakage*) ke komponen lain.

### B. Tata Letak Flexbox (`Column` Layout)
- **`display: flex; flex-direction: column; justify-content: space-between;`**:
  - Mengatur tata letak vertikal kartu agar informasi Pokémon berada di atas dan tombol aksi selalu terkunci rapi di posisi paling bawah.
  - Analogi Flutter: Persis seperti:
    ```dart
    Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        PokemonInfo(...),
        ActionButton(...),
      ],
    )
    ```
  - Properti `align-items` digunakan untuk mengatur sumbu silang horizontal (setara `crossAxisAlignment`).

### C. Tema Dinamis (CSS Variables)
- `background-color: var(--color-background-soft, #ffffff);` membaca tema warna dari [`src/assets/base.css`](../src/assets/base.css), setara dengan `Theme.of(context).colorScheme.surface` di Flutter.

### D. Optimasi Gambar Retro (`image-rendering: pixelated`)
- `object-fit: contain`: Sama seperti `BoxFit.contain` di Flutter agar proporsi gambar tidak melar.
- `image-rendering: pixelated`: Memastikan gambar sprite Pokémon beresolusi rendah tetap tajam per pixel saat diperbesar di layar, tidak kabur/blur.

### E. Micro-Interactions (Pseudo-classes)
- **`:hover`**: Mengangkat kartu sedikit ke atas (`translateY(-2px)`) saat kursor mouse melayang di atasnya.
- **`:active`**: Efek tekanan tombol sedikit menciut (`scale(0.98)`) saat diklik.
- **`:disabled`**: Mengubah kursor jadi `not-allowed` dan warna tombol jadi abu-abu ketika tombol tidak dapat ditekan.
