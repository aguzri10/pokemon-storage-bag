<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found-view">
    <div class="not-found-card">
      <div class="error-badge">404</div>
      <div class="pokeball-graphic" aria-hidden="true">⚪</div>
      <h1 class="error-title">Halaman Tidak Ditemukan</h1>
      <p class="error-description">
        Halaman atau rute yang kamu tuju tidak ditemukan dalam Pokédex. Pastikan URL sudah benar.
      </p>
      <RouterLink :to="{ name: 'home' }" class="btn-home"> ← Kembali ke Storage & Bag </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1rem;
}

.not-found-card {
  max-width: 520px;
  width: 100%;
  background-color: var(--color-background-soft, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.error-badge {
  display: inline-block;
  background-color: #fee2e2;
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.pokeball-graphic {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-heading, #1e293b);
  margin-bottom: 0.75rem;
}

.error-description {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.btn-home:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-home:active {
  transform: scale(0.98);
}
</style>
