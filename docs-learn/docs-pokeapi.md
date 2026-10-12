# 📖 Dokumentasi Pembelajaran: `src/services/pokeapi.js`

> **Tujuan**: Memahami service layer HTTP request di JavaScript/Vue 3 dan membandingkannya dengan mental model Flutter (GetX / Dart).

---

## 📌 1. Gambaran Umum File

File [`src/services/pokeapi.js`](../src/services/pokeapi.js) bertindak sebagai **Service Layer** (setara dengan `ApiService` atau `PokemonProvider` di Flutter).

### Mengapa Dipisahkan dari Komponen UI?
- **Pemisahan Tanggung Jawab (Separation of Concerns)**: Komponen tampilan (UI) tidak boleh tahu detail URL endpoint, header, maupun cara parsing response.
- **Kemudahan Maintenance**: Jika sewaktu-waktu URL PokéAPI berganti versi atau struktur datanya berubah, kita hanya perlu mengubah satu file ini saja tanpa menyentuh file tampilan `.vue`.

### 🔄 Mental Model Flutter (Dart) ⇄ JavaScript (Vue 3):
| Konsep | Flutter / Dart | JavaScript / Vue 3 |
| :--- | :--- | :--- |
| **Pustaka HTTP** | `http.get()` atau `dio.get()` | `fetch()` (bawaan browser modern) |
| **Async Object** | `Future<T>` | `Promise<T>` |
| **Decode Response** | `jsonDecode(response.body)` | `await response.json()` |
| **Filter List** | `list.where((item) => ...)` | `array.filter((item) => ...)` |
| **Transform List** | `list.map((item) => ...).toList()` | `array.map((item) => ...)` |

---

## 🔍 2. Fungsi `extractIdFromUrl(url)`

Fungsi ini mengekstrak nomor ID Pokémon dari URL yang diberikan oleh PokéAPI.

```javascript
export function extractIdFromUrl(url) {
  const segments = url.split('/').filter(Boolean);
  const idStr = segments[segments.length - 1];
  return parseInt(idStr, 10);
}
```

### Penjelasan Detail Langkah demi Langkah:

1. **`url.split('/')`**:
   - Memotong string berdasarkan garis miring (`/`).
   - Contoh input URL: `"https://pokeapi.co/api/v2/pokemon/25/"`.
   - Karena di ujung URL terdapat tanda garis miring, potongannya menyisakan string kosong di akhir:
     ```javascript
     ["https:", "", "pokeapi.co", "api", "v2", "pokemon", "25", ""]
     ```

2. **`.filter(Boolean)`**:
   - Fungsi `filter` di JS sama fungsinya dengan `.where()` di Dart.
   - `Boolean` menyaring dan membuang semua nilai **falsy** (seperti string kosong `""`, `null`, `undefined`, dll.).
   - Hasil setelah filter (hanya tersisa elemen yang memiliki isi):
     ```javascript
     ["https:", "pokeapi.co", "api", "v2", "pokemon", "25"]
     ```

3. **`const idStr = segments[segments.length - 1];`**:
   - Di Dart, kita bisa langsung mengambil elemen terakhir dengan `segments.last`.
   - Di JavaScript standar lama, cara mengambil elemen paling ujung adalah dengan menghitung panjang array dikurangi satu: `segments[segments.length - 1]` (karena index array dimulai dari 0).
   - Hasilnya adalah string `"25"`.

4. **`return parseInt(idStr, 10);`**:
   - Sama seperti `int.parse(idStr)` di Dart, fungsinya mengubah string `"25"` menjadi angka bilangan bulat `25`.
   - Angka `10` adalah parameter *radix* (basis bilangan desimal 0-9). Selalu sertakan radix 10 sebagai *best practice* agar angka tidak disalahartikan sebagai bilangan oktal atau heksadesimal.

---

## 🖼️ 3. Helper `getPokemonSpriteUrl(id)`

```javascript
export function getPokemonSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
```

- Fungsi pembantu (helper) untuk membuat URL gambar sprite resmi depan Pokémon secara langsung berdasarkan ID.
- Sangat berguna di daftar Storage & Bag sehingga kita **tidak perlu melakukan HTTP request detail 20 kali hanya untuk menampilkan thumbnail gambar**.

---

## 📋 4. Fungsi `getPokemonList()`

Mengambil daftar 20 Pokémon awal untuk ditampilkan di Storage.

```javascript
export async function getPokemonList() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=20&offset=0`);
  if (!response.ok) {
    throw new Error(`Gagal mengambil data Pokémon: ${response.statusText}`);
  }

  const data = await response.json();

  return data.results.map((pokemon) => {
    const id = extractIdFromUrl(pokemon.url);
    return {
      id,
      name: pokemon.name,
      url: pokemon.url,
      sprite: getPokemonSpriteUrl(id),
    };
  });
}
```

### Poin-Poin Kunci:

- **String Interpolation / Template Literals (`` `${BASE_URL}...` ``)**:
  - Di Dart: `'$baseUrl/pokemon?limit=20&offset=0'`.
  - Di JavaScript: Menggunakan backtick (\`) dan tanda `${}`.
- **Pengecekan Response (`if (!response.ok)`)**:
  - Di Dart: `if (response.statusCode != 200) { throw Exception(...); }`.
  - Di JS: Objek `response` memiliki getter `.ok` bawaan yang bernilai `true` untuk rentang status 200-299.
- **Parsing JSON (`await response.json()`)**:
  - Di Dart: `jsonDecode(response.body)`.
  - Di JS: `await response.json()` membaca stream respon dan mengubahnya menjadi objek JavaScript.
- **Mapping Data Bersih (`data.results.map(...)`)**:
  - Response asli PokéAPI hanya memberikan `{ name, url }`.
  - Kita memperkaya objek tersebut dengan menambahkan `id` (hasil ekstrak) dan `sprite` (URL gambar) agar komponen UI bisa langsung memakainya dengan mudah.
- **Mengapa return langsung tanpa `Promise(...)`?**:
  - Setiap fungsi yang diawali kata kunci `async` akan secara otomatis membungkus (*auto-wrap*) nilai kembaliannya menjadi `Promise` (setara `Future` di Dart). Jadi kita cukup menulis `return data.results.map(...)`.

---

## 🔍 5. Fungsi `getPokemonDetail(nameOrId)`

Mengambil data spesifik dan mendalam dari satu Pokémon berdasarkan nama (misal `"pikachu"`) atau ID (misal `25`).

```javascript
export async function getPokemonDetail(nameOrId) {
  const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!response.ok) {
    throw new Error(`Gagal mengambil detail Pokémon ${nameOrId}: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    artwork:
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      getPokemonSpriteUrl(data.id),
    height: data.height / 10,
    weight: data.weight / 10,
    types: data.types.map((item) => item.type.name),
    abilities: data.abilities.map((item) => item.ability.name),
    stats: data.stats.map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),
  };
}
```

### Analisis Data Sesuai Rubrik Penilaian:

| Properti | Logika / Kode | Alasan & Kebutuhan |
| :--- | :--- | :--- |
| **`artwork`** | Fallback 3 lapis menggunakan `\|\|` dan kurung siku `['official-artwork']` | Mencegah gambar rusak/pecah di UI. Prioritas: 1) Official artwork kualitas tinggi &rarr; 2) Sprite default &rarr; 3) Helper fallback URL. |
| **`height`** | `data.height / 10` | PokéAPI mengembalikan satuan desimeter. Dibagi 10 agar menjadi satuan **meter** (sesuai spesifikasi). |
| **`weight`** | `data.weight / 10` | PokéAPI mengembalikan satuan hektogram. Dibagi 10 agar menjadi satuan **kilogram** (sesuai spesifikasi). |
| **`types`** | `data.types.map((item) => item.type.name)` | Struktur PokéAPI sangat bertumpuk (nested). Kita menyederhanakannya menjadi array nama tipe: `['electric']`. |
| **`abilities`** | `data.abilities.map((item) => item.ability.name)` | Menyederhanakan nested array menjadi array string murni: `['static', 'lightning-rod']`. |
| **`stats`** | `data.stats.map((item) => ({ name: item.stat.name, value: item.base_stat }))` | Diformat menjadi pasangan `{ name, value }` yang sangat ideal untuk dirender sebagai progress bar atau grafik statistik di UI. |
