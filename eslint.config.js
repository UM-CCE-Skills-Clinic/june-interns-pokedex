// import globals from 'globals';
// import eslintConfigPrettier from 'eslint-config-prettier';

// export default [
//   {
//     languageOptions: {
//       ecmaVersion: 2022,
//       sourceType: 'module',
//       globals: {
//         ...globals.node,
//         ...globals.jest
//       }
//     },
//     rules: {
//       'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
//       'no-console': 'off',
//       'prefer-const': 'error',
//       'no-var': 'error',
//       'eqeqeq': ['error', 'always'],
//       'curly': ['error', 'all'],
//       'no-throw-literal': 'error',
//       'no-return-await': 'error',
//       'require-await': 'error'
//     }
//   },
//   eslintConfigPrettier
// ];


import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    // Fix 1: Explicitly specify which files to run linting on
    files: ['src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      
      // Fix 2: Replaced deprecated 'no-throw-literal' with ESLint v9 equivalent
      'only-throw-error': 'error', 
      
      // Fix 3: Removed completely deprecated 'no-return-await' (no longer needed in native Node)
      'require-await': 'error'
    }
  },
  eslintConfigPrettier
];
