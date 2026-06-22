import axios from 'axios';
import { config } from '../config/index.js';

// Get the base URL from config
const { baseUrl: BASE_URL } = config.pokeapi;

/**
 * Fetch a paginated list of all Pokemon
 * @param {number} limit - Number of Pokemon to fetch
 * @param {number} offset - Starting position
 * @returns {Promise<Object>} - List of Pokemon with count
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