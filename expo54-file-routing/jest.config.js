/** @type {import("jest").Config} **/
export default {
  preset: "jest-expo",
  setupFiles: ["./test/jest-setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      // diagnostics: false,
      tsconfig: {
        jsx: "react-jsx",
      },
    }],
  },
};