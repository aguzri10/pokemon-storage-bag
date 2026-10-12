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

<template>
  <div class="pokemon-card">
    <RouterLink
      :to="{ name: 'pokemon-detail', params: { name: pokemon.name } }"
      class="card-link"
      :title="`Lihat detail ${pokemon.name}`"
    >
      <div class="sprite-container">
        <img :src="pokemon.sprite" :alt="pokemon.name" class="pokemon-sprite" loading="lazy" />
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

<style scoped>
.pokemon-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 1rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  overflow: hidden;
}

.pokemon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  border-color: var(--color-border-hover, #cbd5e1);
}

.card-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  border-radius: 8px;
  padding: 0.5rem;
}

.card-link:hover {
  background-color: transparent;
}

.sprite-container {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-mute, #f1f5f9);
  border-radius: 50%;
  margin-bottom: 0.75rem;
}

.pokemon-sprite {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
  object-fit: contain;
}

.pokemon-info {
  text-align: center;
  width: 100%;
}

.pokemon-id {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  display: block;
}

.pokemon-name {
  font-size: 1.05rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 0.25rem;
  color: var(--color-heading, #1e293b);
  word-break: break-word;
}

.card-actions {
  margin-top: 1rem;
  width: 100%;
}

.action-button {
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: #3b82f6;
  color: #ffffff;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease,
    transform 0.1s ease;
}

.action-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.action-button:active:not(:disabled) {
  transform: scale(0.98);
}

.action-button--disabled,
.action-button:disabled {
  background-color: #94a3b8;
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
</style>
