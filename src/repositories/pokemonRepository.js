import axios from 'axios';
import { config } from '../config/index.js';

const { baseUrl: BASE_URL } = config.pokeapi;

/**
 * Fetch a paginated list of Pokemon (names + urls only).
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{count:number, results:Array}>}
 */
export const getAllPokemon = async (limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch Pokemon list: ${error.message}`);
  }
};

/**
 * Fetch a single Pokemon by name or id. Returns null on 404.
 * @param {string|number} nameOrId
 */
export const getPokemonByNameOrId = async (nameOrId) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon/${nameOrId.toString().toLowerCase()}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch Pokemon: ${error.message}`);
  }
};

/**
 * Fetch species data (descriptions, genus, color). Returns null on 404.
 * @param {string|number} nameOrId
 */
export const getPokemonSpecies = async (nameOrId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/pokemon-species/${nameOrId.toString().toLowerCase()}`
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch Pokemon species: ${error.message}`);
  }
};

/**
 * Search Pokemon names locally against the full list.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<{count:number, results:Array}>}
 */
export const searchPokemon = async (query, limit = config.pagination.maxSearchLimit) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: { limit, offset: 0 }
    });

    const allPokemon = response.data.results;
    const filtered = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    );

    return { count: filtered.length, results: filtered };
  } catch (error) {
    throw new Error(`Failed to search Pokemon: ${error.message}`);
  }
};

/**
 * Fetch all Pokemon types.
 * @returns {Promise<Array>}
 */
export const getPokemonTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/type`);
    return response.data.results;
  } catch (error) {
    throw new Error(`Failed to fetch Pokemon types: ${error.message}`);
  }
};

/**
 * Fetch all Pokemon of a given type. Returns null on 404.
 * @param {string} typeName
 */
export const getPokemonByType = async (typeName) => {
  try {
    const response = await axios.get(`${BASE_URL}/type/${typeName.toLowerCase()}`);
    return response.data.pokemon.map((p) => p.pokemon);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch Pokemon by type: ${error.message}`);
  }
};
