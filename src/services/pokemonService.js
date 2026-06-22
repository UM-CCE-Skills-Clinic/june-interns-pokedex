import {
  getPokemonList,
  getPokemonByNameOrId,
} from '../repositories/pokemonRepository.js';

export const fetchPokemonList = async (limit, offset) => {
  const data = await getPokemonList(limit, offset);
  return data;
};

export const fetchPokemonByNameOrId = async (nameOrId) => {
  const data = await getPokemonByNameOrId(nameOrId);
  return data;
};