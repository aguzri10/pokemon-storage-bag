const BASE_URL = 'https://pokeapi.co/api/v2'

export function extractIdFromUrl(url) {
  const segments = url.split('/').filter(Boolean)
  const idStr = segments[segments.length - 1]
  return parseInt(idStr, 10)
}

export function getPokemonSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export async function getPokemonList() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=20&offset=0`)
  if (!response.ok) {
    throw new Error(`Gagal mengambil data Pokémon: ${response.statusText}`)
  }

  const data = await response.json()

  return data.results.map((pokemon) => {
    const id = extractIdFromUrl(pokemon.url)
    return {
      id,
      name: pokemon.name,
      url: pokemon.url,
      sprite: getPokemonSpriteUrl(id),
    }
  })
}

export async function getPokemonDetail(nameOrId) {
  const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`)
  if (!response.ok) {
    throw new Error(`Gagal mengambil detail Pokémon ${nameOrId}: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    id: data.id,
    name: data.name,
    artwork:
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.front_default ||
      getPokemonSpriteUrl(data.id),
    height: data.height / 10, // dalam satuan meter
    weight: data.weight / 10, // dalam satuan kilogram
    types: data.types.map((item) => item.type.name),
    abilities: data.abilities.map((item) => item.ability.name),
    stats: data.stats.map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),
  }
}
