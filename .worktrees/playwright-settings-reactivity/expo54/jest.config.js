/** @type {import("jest").Config} **/
export default {
  preset: "jest-expo",
  setupFiles: ["./test/jest-setup.ts"],
  testMatch: [
    '<rootDir>/{src,test}/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      // diagnostics: false,
      tsconfig: {
        jsx: "react-jsx",
      },
    }],
  },
};