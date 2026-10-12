# 📖 Dokumentasi Pembelajaran: `src/components/PokemonList.vue`

> **Tujuan**: Memahami pembuatan komponen wrapper list, struktur 3 layer SFC (.vue), rendering daftar reaktif dengan direktif `v-for` dan `:key`, pengelolaan *empty state* dengan `v-if`, serta pendelegasian event (*Event Delegation / Bubbling*) dari child ke parent dalam arsitektur "Props down, events up".

---

## 📌 1. Gambaran Umum Komponen

Komponen [`src/components/PokemonList.vue`](../src/components/PokemonList.vue) adalah komponen container yang membungkus kumpulan kartu Pokémon. Komponen ini dirancang agar dapat digunakan secara fleksibel baik untuk **Storage Pokémon** maupun **Bag Pokémon**.

Fitur utama:
- Header bagian dengan judul (`title`) dan lencana jumlah item (`badgeCount`).
- Slot opsional (`<slot name="header-action" />`) untuk tombol aksi tambahan jika diperlukan.
- Penanganan kondisi kosong (*Empty State*) menggunakan `v-if` & `v-else`.
- Grid responsif yang me-render komponen atomik [`PokemonCard.vue`](./PokemonCard.vue).
- Delegasi event: menangkap emit `'action'` dari kartu anak lalu meneruskannya ke parent bersama payload objek Pokémon terkait.

---

## 🧱 2. Struktur 3 Layer File `.vue` (Single File Component / SFC)

Setiap file komponen di Vue 3 menggabungkan 3 pilar utama tampilan web:

```vue
<script setup>
  /* 1. LAYER LOGIKA: Props, Emits, State, Lifecycle, Helper Functions */
</script>

<template>
  <!-- 2. LAYER STRUKTUR UI: Pohon Tampilan (mirip Widget Tree di Flutter) -->
</template>

<style scoped>
  /* 3. LAYER STYLING: CSS terisolasi (tidak bocor ke komponen lain) */
</style>
```

> **Padanan di Flutter:**
> - `<script setup>` = Bagian deklarasi variabel, constructor parameter, dan method pada class widget.
> - `<template>` = Seluruh isi method `Widget build(BuildContext context)`.
> - `<style scoped>` = `BoxDecoration`, `TextStyle`, dan properti styling lokal pada widget.

---

## 🔄 Mental Model: GridView.builder (Flutter) ⇄ PokemonList (Vue 3)

| Kebutuhan / Konsep | Flutter | Vue 3 (Composition API) |
| :--- | :--- | :--- |
| **Data Source List** | `final List<Pokemon> pokemons;` | `pokemons: { type: Array, required: true }` |
| **Kondisi Kosong** | `pokemons.isEmpty ? EmptyState() : GridView(...)` | `<div v-if="pokemons.length === 0">...</div><div v-else>...</div>` |
| **Render List / Grid** | `GridView.builder(itemCount: ..., itemBuilder: ...)` | `<PokemonCard v-for="pokemon in pokemons" :key="pokemon.id" ... />` |
| **Identifier Unik** | `Key(pokemon.id.toString())` | `:key="pokemon.id"` (wajib untuk DOM diffing efisien) |
| **Callback Item Klik** | `onAction: () => onPokemonAction(pokemon)` | `@action="handleCardAction(pokemon)"` |

---

## 🧩 3. Bedah Script (`<script setup>`)

```vue
<script setup>
import PokemonCard from './PokemonCard.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  pokemons: {
    type: Array,
    required: true,
  },
  badgeCount: {
    type: [Number, String],
    default: null,
  },
  actionLabel: {
    type: String,
    required: true,
  },
  actionDisabled: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: 'Tidak ada Pokémon.',
  },
})

const emit = defineEmits(['action'])

function handleCardAction(pokemon) {
  emit('action', pokemon)
}
</script>
```

### Penjelasan Kunci:
1. **`defineProps` Lengkap**:
   - `pokemons`: Array objek Pokémon yang akan ditampilkan.
   - `actionLabel` & `actionDisabled`: Diteruskan langsung (*forwarded*) ke setiap `PokemonCard`.
   - `emptyMessage`: Pesan kustom ketika array kosong (misalnya *"Bag masih kosong"* atau *"Tidak ada Pokémon yang cocok"*).
2. **Event Delegation (`handleCardAction`)**:
   - `PokemonCard` hanya tahu tombolnya diklik (`emit('action')`).
   - `PokemonList` tahu **Pokémon mana** yang kartunya diklik, lalu menambahkan payload tersebut ke emit induk: `emit('action', pokemon)`.
   - Parent (`HomeView.vue`) menerima objek Pokémon spesifik dan memanggil action Pinia yang sesuai (`moveToBag(pokemon)` atau `moveToStorage(pokemon)`).

---

## 🖼️ 4. Bedah Template (`<template>`)

```vue
<template>
  <section class="pokemon-list-section">
    <!-- Header & Slot Aksi Tambahan -->
    <header class="list-header">
      <div class="title-group">
        <h2 class="list-title">{{ title }}</h2>
        <span v-if="badgeCount !== null" class="badge-count">{{ badgeCount }}</span>
      </div>
      <slot name="header-action" />
    </header>

    <!-- Empty State -->
    <div v-if="pokemons.length === 0" class="empty-state">
      <div class="empty-icon" aria-hidden="true">📦</div>
      <p class="empty-text">{{ emptyMessage }}</p>
    </div>

    <!-- Grid List -->
    <div v-else class="pokemon-grid">
      <PokemonCard
        v-for="pokemon in pokemons"
        :key="pokemon.id"
        :pokemon="pokemon"
        :action-label="actionLabel"
        :action-disabled="actionDisabled"
        @action="handleCardAction(pokemon)"
      />
    </div>
  </section>
</template>
```

### Mengapa `:key="pokemon.id"` Sangat Penting?
Di Vue (mirip `Key` di Flutter), `:key` memberikan identitas unik pada setiap elemen virtual DOM:
- Ketika item berpindah dari Storage ke Bag, Vue tidak perlu me-render ulang seluruh grid dari nol.
- Vue hanya mencopot (*unmount*) elemen kartu dengan ID terkait dan menyisipkannya ke container tujuan. Ini menjamin performa rendering yang sangat cepat (*efficient DOM patch*).

---

## 🎨 5. Bedah Style (`<style scoped>`)

### A. Mekanisme `scoped`
Atribut `scoped` memastikan CSS di file ini diisolasi: Vue secara otomatis menyematkan atribut unik (seperti `data-v-xxxx`) ke elemen HTML, sehingga nama class `.list-title` tidak akan merusak judul di komponen lain.

### B. Auto-Responsive Grid dengan `minmax`
```css
.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.85rem;
}

@media (min-width: 640px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 1rem;
  }
}
```
* **`repeat(auto-fill, minmax(130px, 1fr))`**: Padanan langsung dari **`SliverGridDelegateWithMaxCrossAxisExtent`** di Flutter.
* Browser otomatis membagi jumlah kolom secara fleksibel: di layar HP muat 2 kolom, di tablet muat 3-4 kolom, dan di laptop otomatis 5-6 kolom tanpa perlu JavaScript tambahan.

### C. Pill Badge & Centered Empty State
* **`border-radius: 9999px;`**: Trik CSS untuk menghasilkan bentuk kapsul/pill bulat sempurna (seperti `StadiumBorder` di Flutter).
* **`.empty-state`**: Menggunakan flexbox centering (`align-items: center; justify-content: center;`) dan `border: 2px dashed` untuk visual kotak kosong yang menarik.
