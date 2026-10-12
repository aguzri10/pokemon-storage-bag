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

<template>
  <section class="pokemon-list-section">
    <header class="list-header">
      <div class="title-group">
        <h2 class="list-title">{{ title }}</h2>
        <span v-if="badgeCount !== null" class="badge-count">{{ badgeCount }}</span>
      </div>
      <slot name="header-action" />
    </header>

    <div v-if="pokemons.length === 0" class="empty-state">
      <div class="empty-icon" aria-hidden="true">📦</div>
      <p class="empty-text">{{ emptyMessage }}</p>
    </div>

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

<style scoped>
.pokemon-list-section {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.list-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
  margin: 0;
}

.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.55rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 9999px;
  background-color: #e0e7ff;
  color: #3730a3;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.85rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: var(--color-background-mute, #f8fafc);
  border-radius: 12px;
  border: 2px dashed var(--color-border, #e2e8f0);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.empty-text {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

@media (min-width: 640px) {
  .pokemon-grid {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 1rem;
  }
}
</style>
