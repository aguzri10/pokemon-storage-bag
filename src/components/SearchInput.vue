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

<style scoped>
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  font-size: 0.95rem;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.65rem 2.25rem 0.65rem 2.5rem;
  font-size: 0.95rem;
  border: 1px solid var(--color-border, #cbd5e1);
  border-radius: 8px;
  background-color: var(--color-background, #ffffff);
  color: var(--color-text, #1e293b);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.search-input::placeholder {
  color: #94a3b8;
}

/* Hilangkan tombol clear default browser agar konsisten */
.search-input::-webkit-search-decoration,
.search-input::-webkit-search-cancel-button,
.search-input::-webkit-search-results-button,
.search-input::-webkit-search-results-decoration {
  display: none;
}

.clear-button {
  position: absolute;
  right: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background-color: transparent;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 50%;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.clear-button:hover {
  background-color: rgba(148, 163, 184, 0.2);
  color: var(--color-heading, #1e293b);
}
</style>
