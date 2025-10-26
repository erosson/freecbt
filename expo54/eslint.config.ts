// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
const expoConfig = require("eslint-config-expo/flat");

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "off",
    },
  },
]);
