import { defineStore } from 'pinia'
import { getPokemonList } from '../services/pokeapi'

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    storage: [],
    bag: [],
    isLoading: false,
    error: null,
    isInitialized: false,
  }),

  getters: {
    isBagFull: (state) => state.bag.length >= 6,
    storageCount: (state) => state.storage.length,
    bagCount: (state) => state.bag.length,
  },

  actions: {
    async fetchPokemons() {
      if (this.isInitialized || this.storage.length > 0 || this.bag.length > 0) {
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const pokemons = await getPokemonList()
        this.storage = pokemons
        this.isInitialized = true
      } catch (err) {
        this.error = err.message || 'Gagal memuat Pokémon. Silakan coba lagi.'
      } finally {
        this.isLoading = false
      }
    },

    moveToBag(pokemon) {
      if (this.isBagFull) {
        return { success: false, message: 'Bag sudah penuh! Maksimal 6 Pokémon.' }
      }

      this.storage = this.storage.filter((p) => p.id !== pokemon.id)

      this.bag.push(pokemon)

      return { success: true }
    },

    moveToStorage(pokemon) {
      this.bag = this.bag.filter((p) => p.id !== pokemon.id)

      this.storage.push(pokemon)
      this.storage.sort((a, b) => a.id - b.id)

      return { success: true }
    },
  },
})
