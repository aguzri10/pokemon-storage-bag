# 📖 Dokumentasi Pembelajaran: `src/App.vue`

> **Tujuan**: Memahami peran `App.vue` sebagai **Root Component** (akar pohon tampilan), konsep arsitektur **App Shell (Persistent Layout)**, pemanfaatan `<RouterView />` dan `<RouterLink>`, serta teknik tata letak *Sticky Footer* menggunakan Flexbox.

---

## 📌 1. Gambaran Umum Komponen

File [`src/App.vue`](../src/App.vue) adalah **komponen induk tertinggi** dalam hierarki aplikasi Vue 3 kita. Komponen ini membungkus seluruh aplikasi dan bertindak sebagai bingkai luar (*App Shell*) yang menyediakan:
1. **Header & Navbar Global**: Menampilkan ikon ransel Pokémon, judul aplikasi, dan navigasi utama.
2. **Main Content Container**: Wadah dinamis tempat halaman yang sedang aktif dirender melalui `<RouterView />`.
3. **Footer Global**: Catatan kaki aplikasi yang selalu berada di bagian bawah layar.

---

## 🔄 2. Mental Model: MaterialApp & Scaffold (Flutter) ⇄ App.vue (Vue 3)

| Konsep Flutter | Padanan Vue 3 (App.vue) | Penjelasan & Peran |
| :--- | :--- | :--- |
| **`MaterialApp`** | `createApp(App)` di `main.js` | Titik awal inisialisasi aplikasi. |
| **`Scaffold` Utama** | `<div class="app-layout">` | Struktur layout dasar aplikasi (Header, Body, Footer). |
| **`AppBar` / Header** | `<header class="app-header">` | Bagian atas yang **selalu tampil di mana pun halamannya** (*Persistent*). |
| **`body: Navigator(...)`** | `<RouterView />` | Area tempat halaman berganti-ganti sesuai URL yang sedang dibuka. |
| **`bottomNavigationBar` / Footer** | `<footer class="app-footer">` | Bagian bawah yang menempel di ujung layar. |
| **`Get.toNamed('/home')`** | `<RouterLink :to="{ name: 'home' }">` | Navigasi SPA instan tanpa reload browser. |

---

## 🖼️ 3. Konsep Arsitektur: "App Shell" (Persistent Layout)

Di aplikasi web modern berbasis *Single Page Application* (SPA), kita tidak ingin header dan footer berkedip (*flicker*) atau dibuat ulang dari awal setiap kali pengguna berpindah halaman.

```text
┌────────────────────────────────────────────────────────┐
│  <header class="app-header">                           │
│    🎒 Pokémon Storage & Bag (Brand / Navbar)           │  <-- PERSISTENT (Tetap diam di tempat)
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  <main class="app-main">                               │
│    <RouterView />                                      │  <-- DINAMIS (Hanya bagian ini yang berganti)
│                                                        │
│    • Jika di "/"          ➔ Me-render HomeView         │
│    • Jika di "/pokemon/1" ➔ Me-render PokemonDetailView│
│    • Jika rute salah      ➔ Me-render NotFoundView     │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  <footer class="app-footer">                           │
│    Dibangun dengan Vue 3 (Composition API) & Pinia     │  <-- PERSISTENT (Tetap diam di tempat)
└────────────────────────────────────────────────────────┘
```

### Keuntungan App Shell:
1. **Don't Repeat Yourself (DRY)**: Kita cukup mendesain header dan footer sekali saja di `App.vue`, tidak perlu meng-copy paste ke setiap file halaman view.
2. **Performa Lebih Gesit**: Karena header sudah terpasang di DOM, browser hanya menukar elemen di dalam `<RouterView />`.

---

## 🧩 4. Bedah Script (`<script setup>`)

```vue
<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>
```

Layer script sangat bersih dan ringkas karena hanya mengimpor 2 komponen bawaan Vue Router:
1. **`RouterLink`**: Menghasilkan tag anchor HTML (`<a>`) yang dicegat agar navigasi dilakukan di sisi client (*Client-Side Routing*) tanpa request halaman penuh ke server.
2. **`RouterView`**: Titik tumpu (*outlet*) tempat komponen rute aktif ditempelkan ke DOM.

---

## 📐 5. Bedah Template (`<template>`)

```vue
<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-container">
        <!-- Named Route Navigation -->
        <RouterLink :to="{ name: 'home' }" class="brand-link">
          <span class="brand-icon" aria-hidden="true">🎒</span>
          <div class="brand-info">
            <h1 class="brand-title">Pokémon Storage & Bag</h1>
            <p class="brand-tagline">Kelola tim Pokémon Anda (Maksimal 6 di Bag)</p>
          </div>
        </RouterLink>

        <nav class="app-nav">
          <RouterLink :to="{ name: 'home' }" class="nav-link">Beranda</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>Dibangun dengan Vue 3 (Composition API) & Pinia</p>
    </footer>
  </div>
</template>
```

### Mengapa Menggunakan `:to="{ name: 'home' }"`?
Alih-alih menulis path string mentah (`to="/" atau to="/home"`), kita menggunakan objek **Named Route**:
- Jika di masa mendatang path URL berubah dari `'/'` menjadi `'/dashboard'`, kita tidak perlu mengubah puluhan `<RouterLink>`. Cukup ubah konfigurasi path di `src/router/index.js`, dan semua link bernama `'home'` otomatis tetap bekerja.
- Ini adalah salah satu **aturan mutlak** dalam rubrik teknis penugasan.

---

## 🎨 6. Bedah Style (`<style scoped>`)

### A. Pola Sticky Footer dengan Flexbox
Salah satu masalah umum pada web adalah ketika isi halaman hanya sedikit (misal sedang loading atau storage kosong), footer sering kali "mengapung" canggung di tengah layar.

Masalah ini diselesaikan dengan rumus Flexbox berikut:

```css
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Tinggi minimal 100% dari viewport browser */
  width: 100%;
}

.app-main {
  flex: 1; /* MEREGANGKAN KONTEN (Mirip Expanded di Flutter) */
  width: 100%;
}
```

* **`min-height: 100vh`**: Memastikan tinggi pembungkus utama minimal setinggi layar browser pengguna.
* **`flex: 1`**: Mirip dengan membungkus widget dengan **`Expanded()`** di Flutter. Elemen `<main>` akan meregang mengisi sisa ruang vertikal yang kosong, sehingga otomatis mendorong footer ke batas paling bawah layar.

### B. Indikator Rute Aktif Otomatis
```css
.nav-link.router-link-active {
  color: #2563eb;
  background-color: #eff6ff;
}
```
* Vue Router secara otomatis mendeteksi URL saat ini. Jika URL cocok dengan rute `RouterLink`, Vue Router akan menambahkan class CSS `.router-link-active` tanpa kita perlu menulis logika JavaScript manual!
