/** @type {import("jest").Config} **/
export default {
  preset: "jest-expo",
  setupFiles: ["./test/jest-setup.ts"],
  testMatch: [
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/test/**/*.{spec,test}.{js,jsx,ts,tsx}',
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