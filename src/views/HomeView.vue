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
  return pokemonStore.storage.filter((pokemon) => pokemon.name.toLowerCase().includes(query))
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

<template>
  <div class="home-view">
    <!-- State: Loading -->
    <section v-if="pokemonStore.isLoading" class="state-container state-loading">
      <div class="loading-spinner" aria-hidden="true" />
      <p class="state-title">Memuat Pokémon...</p>
      <p class="state-subtitle">Sedang mengambil data 20 Pokémon awal dari PokéAPI.</p>
    </section>

    <!-- State: Error -->
    <section v-else-if="pokemonStore.error" class="state-container state-error">
      <div class="state-icon" aria-hidden="true">⚠️</div>
      <p class="state-title">Terjadi Kesalahan</p>
      <p class="state-message">{{ pokemonStore.error }}</p>
      <button type="button" class="btn-retry" @click="handleRetry">Coba Lagi</button>
    </section>

    <!-- State: Success / Content -->
    <div v-else class="home-grid">
      <!-- Kolom Kiri: Storage Pokémon -->
      <section class="column storage-column">
        <div class="column-search">
          <SearchInput v-model="searchQuery" placeholder="Cari Pokémon di Storage..." />
        </div>

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

      <!-- Kolom Kanan: Bag Pokémon -->
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

<style scoped>
.home-view {
  width: 100%;
}

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

.column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bag-full-alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  min-height: 360px;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--color-border, #e2e8f0);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.state-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
  margin-bottom: 0.35rem;
}

.state-subtitle,
.state-message {
  font-size: 0.95rem;
  color: #64748b;
  max-width: 400px;
  margin-bottom: 1rem;
}

.btn-retry {
  padding: 0.6rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #ef4444;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-retry:hover {
  background-color: #dc2626;
}
</style>
