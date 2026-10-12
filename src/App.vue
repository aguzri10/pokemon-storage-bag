<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-container">
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

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-header {
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.brand-icon {
  font-size: 2.25rem;
  line-height: 1;
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading, #1e293b);
  line-height: 1.2;
}

.brand-tagline {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  color: #64748b;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #2563eb;
  background-color: #eff6ff;
}

.app-main {
  flex: 1;
  width: 100%;
}

.app-footer {
  margin-top: 3rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--color-border, #e2e8f0);
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
}
</style>
