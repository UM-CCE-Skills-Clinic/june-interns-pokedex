import dotenv from 'dotenv';

// Load env variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  pokeapi: {
    baseUrl: process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2'
  },
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT, 20) || 20,
    maxSearchLimit: parseInt(process.env.MAX_SEARCH_LIMIT, 10) || 1000
  }
};
