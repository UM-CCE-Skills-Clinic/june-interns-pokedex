import axios from 'axios';
import { config } from '../config/index.js';

const BASE_URL = config.pokeApiBaseUrl;

/**
 * Get list of Pokémon (paginated)
 */
export const getPokemonList = async (limit = 20, offset = 0) => {
  const response = await axios.get(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );

  return response.data;
};

/**
 * Get a single Pokémon by name or ID
 */
export const getPokemonByNameOrId = async (nameOrId) => {
  const response = await axios.get(
    `${BASE_URL}/pokemon/${nameOrId}`
  );

  return response.data;
};