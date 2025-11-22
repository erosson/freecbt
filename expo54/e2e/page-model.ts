// page object models. https://playwright.dev/docs/pom
// incomplete - add more locators as needed

import { Locator, Page } from "@playwright/test";

// playwright gets very upset if we import certain expo modules (localization), so no importing these.
// probably for the best anyway, keeps the tests obvious
const SHRUG_EMOJI = "🤷‍";
const ALL_OR_NOTHING_EMOJI = "🌓";

export function models(page: Page) {
  return {
    intro: intro(page),
    createThought: createThought(page),
    viewThought: viewThought(page),
  };
}

export function intro(page: Page) {
  return {
    guideButton: page.getByRole("button", { name: "The FreeCBT Guide" }),
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
  };
}

export function viewThought(page: Page) {
  function entry(name: string) {
    return page.getByRole("link", { name });
  }
  function maybeEntryText(l: Locator, name?: string) {
    return name ? l.getByText(name) : l;
  }
  const distortion = (name?: string) =>
    maybeEntryText(page.locator('a[href*="distortion"]'), name);
  return {
    title: page.getByText("FreeCBT"),
    missingEntries: page.getByRole("link", { name: SHRUG_EMOJI }),
    entry,
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
