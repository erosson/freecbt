// page object models. https://playwright.dev/docs/pom
// incomplete - add more locators as needed

import { Locator, Page } from "@playwright/test";

// playwright gets very upset if we import certain expo modules (localization), so no importing these.
// probably for the best anyway, keeps the tests obvious
const SHRUG_EMOJI = "🤷‍";
const ALL_OR_NOTHING_EMOJI = "🌓";

export function intro(page: Page) {
  return {
    guideButton: page.getByRole("link", { name: "The FreeCBT Guide" }),
  };
}

export function createThought(page: Page) {
  return {
    title: page.getByText("FreeCBT"),
    automaticThought: page.getByPlaceholder("might crash"),
    distortionAllOrNothing: page.getByText("All or Nothing"),
    challenge: page.getByPlaceholder("might not be true"),
    alternativeThought: page.getByPlaceholder("could we think instead"),
    submitButton: page.getByRole("button", { name: "SAVE & FINISH" }),
    navHelp: page.getByRole("link", { name: "help" }),
    navListThoughts: page.getByRole("link", { name: "list thoughts" }),
  };
}

export function viewThought(page: Page) {
  function maybeEntryText(l: Locator, name?: string) {
    return name ? l.getByText(name) : l;
  }
  const distortion = (name?: string) =>
    maybeEntryText(page.locator('a[href*="distortion"]'), name);
  return {
    title: page.getByText("FreeCBT"),
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
    navSettings: page.getByRole("link", { name: "settings" }),
    navNewThought: page.getByRole("link", { name: "new thought" }),
  };
}

export function settings(page: Page) {
  return {
    title: page.getByText("FreeCBT*"),
    setPincode: page.getByRole("link", { name: "Set Pincode" }),
    updatePincode: page.getByRole("link", { name: "Update Pincode" }),
    clearPincode: page.getByText("Clear Pincode"),
    navListThoughts: page.getByRole("link", { name: "list thoughts" }),
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
