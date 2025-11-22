// "Why playwright? This is a mobile app, not a web app."
//
// - Expo recommends @testing-library/react-native, but as soon as I started
//   adding in extra dependencies like expo-router and gestures, it became
//   stupidly complicated. It seems to be best for unit testing - that's great!
//   but I want integration/end-to-end tests.
// - The react-native world seems to recommend Detox. I've never used it, but
//   it promises to run tests in device emulators for CI. Setting up device
//   emulators is not trivial, and I want proof that it works in github-actions
//   before I even begin using it. But, their CI docs don't list github, as of
//   2025/11: https://wix.github.io/Detox/docs/introduction/preparing-for-ci
//   so I am not inclined to learn them right now.
// - There are lots of *bad* e2e test frameworks. I know and trust Playwright
//   to be less-bad. It's web-only, but most of the stuff I care to test can be
//   tested with expo's web build. Not worth the effort to set up and learn
//   Detox for the few things a web build can't verify.
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = 8181;
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: `http://localhost:${PORT}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: `yarn expo start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
