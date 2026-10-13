<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getPokemonDetail } from '../services/pokeapi'
import { usePokemonStore } from '../stores/pokemon'

const route = useRoute()
const pokemonStore = usePokemonStore()

const pokemon = ref(null)
const isLoading = ref(true)
const error = ref(null)

onMounted(() => {
  pokemonStore.fetchPokemons()
})

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

watch(
  () => route.params.name,
  (newName) => {
    if (newName) {
      loadPokemon(newName)
    }
  },
  { immediate: true },
)

const pokemonInBag = computed(() => {
  if (!pokemon.value) return null
  return pokemonStore.bag.find(
    (item) =>
      item.id === pokemon.value.id || item.name.toLowerCase() === pokemon.value.name.toLowerCase(),
  )
})

const pokemonInStorage = computed(() => {
  if (!pokemon.value) return null
  return pokemonStore.storage.find(
    (item) =>
      item.id === pokemon.value.id || item.name.toLowerCase() === pokemon.value.name.toLowerCase(),
  )
})

const locationInfo = computed(() => {
  if (pokemonInBag.value) {
    return {
      type: 'bag',
      label: 'Ada di Bag',
      badgeClass: 'badge-bag',
      buttonLabel: 'Kembalikan ke Storage',
      buttonDisabled: false,
    }
  }

  if (pokemonInStorage.value) {
    return {
      type: 'storage',
      label: 'Ada di Storage',
      badgeClass: 'badge-storage',
      buttonLabel: pokemonStore.isBagFull ? 'Bag Penuh (6/6)' : 'Pindahkan ke Bag',
      buttonDisabled: pokemonStore.isBagFull,
    }
  }

  return {
    type: 'outside',
    label: 'Di luar Storage & Bag',
    badgeClass: 'badge-outside',
    buttonLabel: null,
    buttonDisabled: true,
  }
})

function handleToggleLocation() {
  if (pokemonInBag.value) {
    pokemonStore.moveToStorage(pokemonInBag.value)
  } else if (pokemonInStorage.value) {
    pokemonStore.moveToBag(pokemonInStorage.value)
  }
}

const prevId = computed(() => (pokemon.value && pokemon.value.id > 1 ? pokemon.value.id - 1 : null))
const nextId = computed(() => (pokemon.value ? pokemon.value.id + 1 : null))

const typeColors = {
  normal: '#9ca3af',
  fire: '#f87171',
  water: '#60a5fa',
  electric: '#facc15',
  grass: '#4ade80',
  ice: '#93c5fd',
  fighting: '#ef4444',
  poison: '#c084fc',
  ground: '#fbbf24',
  flying: '#93c5fd',
  psychic: '#f472b6',
  bug: '#a3e635',
  rock: '#d97706',
  ghost: '#a855f7',
  dragon: '#818cf8',
  steel: '#94a3b8',
  fairy: '#f472b6',
}

function getTypeColor(typeName) {
  return typeColors[typeName.toLowerCase()] || '#6b7280'
}

function getStatPercentage(val) {
  return Math.min(100, Math.round((val / 150) * 100))
}
</script>

<template>
  <div class="pokemon-detail-view">
    <!-- Top Navigation -->
    <nav class="detail-nav" aria-label="Navigasi Halaman">
      <RouterLink :to="{ name: 'home' }" class="nav-back"> ← Kembali ke Storage & Bag </RouterLink>
    </nav>

    <!-- State: Loading -->
    <div v-if="isLoading" class="state-container state-loading" role="status">
      <div class="loading-spinner" aria-hidden="true" />
      <p class="state-title">Memuat Detail Pokémon...</p>
    </div>

    <!-- State: Error -->
    <div v-else-if="error" class="state-container state-error" role="alert">
      <div class="state-icon" aria-hidden="true">⚠️</div>
      <h2 class="state-title">Pokémon Tidak Ditemukan</h2>
      <p class="state-message">{{ error }}</p>
      <div class="error-actions">
        <button type="button" class="btn-action" @click="loadPokemon(route.params.name)">
          Coba Lagi
        </button>
        <RouterLink :to="{ name: 'home' }" class="btn-secondary"> Kembali ke Beranda </RouterLink>
      </div>
    </div>

    <!-- State: Success Detail Content -->
    <article v-else-if="pokemon" class="detail-card">
      <!-- Header Info -->
      <header class="detail-header">
        <div class="header-main">
          <span class="pokemon-id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
          <h1 class="pokemon-name">{{ pokemon.name }}</h1>
        </div>

        <div class="types-wrapper">
          <span
            v-for="typeName in pokemon.types"
            :key="typeName"
            class="type-badge"
            :style="{ backgroundColor: getTypeColor(typeName) }"
          >
            {{ typeName }}
          </span>
        </div>
      </header>

      <!-- Status Lokasi & Aksi Pindah -->
      <div class="location-banner">
        <div class="location-status">
          <span class="status-indicator-label">Status Lokasi:</span>
          <span class="location-badge" :class="locationInfo.badgeClass">
            {{ locationInfo.label }}
          </span>
        </div>

        <button
          v-if="locationInfo.buttonLabel"
          type="button"
          class="btn-action"
          :class="{ 'btn-action--disabled': locationInfo.buttonDisabled }"
          :disabled="locationInfo.buttonDisabled"
          @click="handleToggleLocation"
        >
          {{ locationInfo.buttonLabel }}
        </button>
      </div>

      <!-- Detail Grid Content -->
      <div class="detail-grid">
        <!-- Kolom Kiri: Visual Artwork & Info Fisik -->
        <div class="visual-section">
          <div class="artwork-container">
            <img
              :src="pokemon.artwork"
              :alt="`Official artwork dari ${pokemon.name}`"
              class="artwork-image"
            />
          </div>

          <div class="physical-specs">
            <div class="spec-card">
              <span class="spec-label">Tinggi</span>
              <span class="spec-value">{{ pokemon.height }} m</span>
            </div>
            <div class="spec-card">
              <span class="spec-label">Berat</span>
              <span class="spec-value">{{ pokemon.weight }} kg</span>
            </div>
          </div>

          <div class="abilities-container">
            <h3 class="section-subtitle">Kemampuan (Abilities)</h3>
            <div class="abilities-tags">
              <span v-for="ability in pokemon.abilities" :key="ability" class="ability-tag">
                {{ ability.replace('-', ' ') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Base Stats -->
        <div class="stats-section">
          <h2 class="section-title">Base Stats</h2>
          <div class="stats-list">
            <div v-for="stat in pokemon.stats" :key="stat.name" class="stat-row">
              <div class="stat-info">
                <span class="stat-name">{{ stat.name.replace('-', ' ') }}</span>
                <span class="stat-value">{{ stat.value }}</span>
              </div>
              <div class="stat-track">
                <div
                  class="stat-fill"
                  :style="{ width: `${getStatPercentage(stat.value)}%` }"
                  :aria-label="`${stat.name}: ${stat.value}`"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigasi Prev / Next -->
      <footer class="detail-footer">
        <RouterLink
          v-if="prevId"
          :to="{ name: 'pokemon-detail', params: { name: prevId } }"
          class="nav-btn prev-btn"
        >
          ← Sebelumnya (#{{ String(prevId).padStart(3, '0') }})
        </RouterLink>
        <span v-else class="nav-btn nav-btn--disabled"> ← Sebelumnya </span>

        <RouterLink
          v-if="nextId"
          :to="{ name: 'pokemon-detail', params: { name: nextId } }"
          class="nav-btn next-btn"
        >
          Berikutnya (#{{ String(nextId).padStart(3, '0') }}) →
        </RouterLink>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.pokemon-detail-view {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.detail-nav {
  margin-bottom: 1.5rem;
}

.nav-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.2s ease;
}

.nav-back:hover {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

/* State Containers */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border, #e2e8f0);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.25rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.state-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
  margin-bottom: 0.5rem;
}

.state-message {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  background-color: var(--color-background-mute, #f1f5f9);
  color: var(--color-heading, #1e293b);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-border, #e2e8f0);
}

/* Detail Card */
.detail-card {
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .detail-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.pokemon-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
}

.pokemon-name {
  font-size: 2rem;
  font-weight: 800;
  text-transform: capitalize;
  color: var(--color-heading, #1e293b);
  margin: 0;
  line-height: 1.2;
}

.types-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.type-badge {
  color: #ffffff;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Location Banner */
.location-banner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
  background-color: var(--color-background-mute, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .location-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.location-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
}

.location-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.badge-bag {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-storage {
  background-color: #dcfce7;
  color: #166534;
}

.badge-outside {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-action {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: none;
  background-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-action--disabled,
.btn-action:disabled {
  background-color: #94a3b8;
  opacity: 0.65;
  cursor: not-allowed;
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.artwork-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background-mute, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.artwork-image {
  width: 100%;
  max-width: 260px;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
}

.physical-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.spec-card {
  background-color: var(--color-background-mute, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  text-align: center;
}

.spec-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.spec-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
}

.abilities-container {
  background-color: var(--color-background-mute, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  padding: 1rem;
}

.section-subtitle {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
  margin-bottom: 0.6rem;
}

.abilities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ability-tag {
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--color-text, #334155);
}

/* Stats Section */
.stats-section {
  background-color: var(--color-background-mute, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
  margin-bottom: 1.25rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-name {
  font-weight: 600;
  text-transform: capitalize;
  color: #64748b;
}

.stat-value {
  font-weight: 700;
  color: var(--color-heading, #1e293b);
}

.stat-track {
  width: 100%;
  height: 8px;
  background-color: var(--color-border, #e2e8f0);
  border-radius: 9999px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 9999px;
  transition: width 0.4s ease-out;
}

/* Bottom Navigasi Prev/Next */
.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid var(--color-border, #e2e8f0);
  padding-top: 1.5rem;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  background-color: var(--color-background-mute, #f1f5f9);
  color: var(--color-heading, #1e293b);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.2s ease;
}

.nav-btn:hover:not(.nav-btn--disabled) {
  background-color: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.nav-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.next-btn {
  margin-left: auto;
}
</style>
