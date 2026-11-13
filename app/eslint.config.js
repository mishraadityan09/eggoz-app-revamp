// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*'],
  },
  {
    // Resolve the "@/..." alias from jsconfig.json (same mapping Metro uses).
    settings: {
      'import/resolver': {
        typescript: { project: './jsconfig.json' },
      },
    },
  },
]);
