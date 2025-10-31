// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  globalIgnores(['app/(legacy)/*', 'src/legacy/*']),
  {
    ignores: ['dist/*'],
    rules: {
      // often I want to declare a type and a var with the same name, don't whine about it
      // typescript already checks this one for redeclared vars
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "off"
    }
  },
]);
