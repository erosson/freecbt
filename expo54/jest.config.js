/** @type {import('jest').Config} */
const c = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./src/jest.setup.ts"],
  // I give up, jest.setup.ts mocks uuid instead
  // moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
    // https://github.com/uuidjs/uuid/issues/451#issuecomment-1377066303
      // "^uuid$": require.resolve('uuid'),
  // },
};
module.exports = c;
