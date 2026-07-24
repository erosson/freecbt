// page object models. https://playwright.dev/docs/pom
// incomplete - add more locators as needed

import { Locator, Page } from "@playwright/test";

// playwright gets very upset if we import certain expo modules (localization), so no importing these.
// probably for the best anyway, keeps the tests obvious
const SHRUG_EMOJI = "🤷‍";
const ALL_OR_NOTHING_EMOJI = "🌓";

export function nav(page: Page) {
  // Drawer nav items render as `<button href="...">` on web (not `<a>`) as
  // of the current expo-router/react-navigation versions - no tag
  // constraint here, just the href.
  return {
    settings: page.locator('[href="/v2/settings"]'),
    thoughtsList: page.locator('[href="/v2/thoughts"]'),
  };
}

export function intro(page: Page) {
  return {
    guideButton: page.getByRole("link", { name: "The FreeCBT Guide" }),
  };
}

export function createThought(page: Page) {
  return {
    // "FreeCBT" by itself also matches hidden Drawer.Screen entries that
    // share the same title - scope to the visible on-page heading.
    title: page.getByRole("heading", { name: "FreeCBT", exact: true }),
    automaticThought: page.getByTestId("input-automatic-thought"),
    distortionAllOrNothing: page.getByText("All or Nothing"),
    challenge: page.getByPlaceholder("might not be true"),
    alternativeThought: page.getByPlaceholder("could we think instead"),
    submitButton: page.getByTestId("btn-submit"),
    // Drawer nav items render as `button[href]` on web, not `a[href]` -
    // matched by href (locale- and copy-independent), same as nav().
    navHelp: page.locator('[href="/v2/help"]'),
    navListThoughts: page.locator('[href="/v2/thoughts"]'),
  };
}

export function viewThought(page: Page) {
  function maybeEntryText(l: Locator, name?: string) {
    return name ? l.getByText(name) : l;
  }
  const distortion = (name?: string) =>
    maybeEntryText(page.locator('a[href*="distortion"]'), name);
  return {
    // "FreeCBT" by itself also matches hidden Drawer.Screen entries that
    // share the same title - scope to the visible on-page heading.
    title: page.getByRole("heading", { name: "FreeCBT", exact: true }),
    missingEntries: page.getByRole("link", { name: SHRUG_EMOJI }),
    entry: (name: string) => page.getByRole("link", { name }),
    automaticThought: (name?: string) =>
      maybeEntryText(page.locator('a[href*="automatic-thought"]'), name),
    distortion,
    challenge: (name?: string) =>
      maybeEntryText(page.locator('a[href*="challenge"]'), name),
    alternativeThought: (name?: string) =>
      maybeEntryText(page.locator('a[href*="alternative-thought"]'), name),
    distortionAllOrNothing: distortion(ALL_OR_NOTHING_EMOJI),
  };
}

export function listThoughts(page: Page) {
  return {
    title: page.getByText(".FreeCBT"),
    screenRoot: page.getByTestId("screen-root"),
    // Drawer nav items render as `button[href]` on web, not `a[href]` -
    // matched by href (locale- and copy-independent), same as nav().
    navSettings: page.locator('[href="/v2/settings"]'),
    navNewThought: page.locator('[href="/v2/thoughts/create"]'),
    firstThought: page.getByTestId("thought-item"),
  };
}

export function settings(page: Page) {
  return {
    title: page.getByText("FreeCBT*"),
    screenRoot: page.getByTestId("screen-root"),
    setPincode: page.getByRole("link", { name: "Set Pincode" }),
    updatePincode: page.getByRole("link", { name: "Update Pincode" }),
    clearPincode: page.getByText("Clear Pincode"),
    // Drawer nav items render as `button[href]` on web, not `a[href]` -
    // matched by href (locale- and copy-independent), same as nav().
    navListThoughts: page.locator('[href="/v2/thoughts"]'),
    themeLight: page.getByTestId("selector-light"),
    themeDark: page.getByTestId("selector-dark"),
    historyAlternative: page.getByTestId("selector-alternative-thought"),
    historyAutomatic: page.getByTestId("selector-automatic-thought"),
    localePicker: page.getByTestId("locale-picker"),
  };
}

export function setAuth(page: Page) {
  const p = {
    titleEnter: page.getByText("Please set a passcode."),
    titleConfirm: page.getByText("Please re-enter your passcode to confirm."),
    input: page.getByRole("textbox"),
    submitButton: page.getByRole("button", { name: "SUBMIT" }),
  };
  return p;
}

export function auth(page: Page) {
  return {
    title: page.getByText("Please enter your passcode."),
    input: page.getByRole("textbox"),
    submitButton: page.getByRole("button", { name: "SUBMIT" }),
  };
}
