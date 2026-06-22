import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  pokeApiBaseUrl: process.env.POKEAPI_BASE_URL,
  defaultPageLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT, 10) || 20,
  maxSearchLimit: parseInt(process.env.MAX_SEARCH_LIMIT, 10) || 1000,
};