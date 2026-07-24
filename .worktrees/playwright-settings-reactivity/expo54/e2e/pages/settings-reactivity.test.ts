import { PageModel } from "@/e2e";
import { expect, test } from "@playwright/test";

// Mirrors LightTheme.backgroundRoot and DarkTheme.backgroundRoot
// in expo54/src/hooks/use-style.ts. Keep synchronized with that palette.
const LIGHT_BACKGROUND_ROOT = "rgba(252,252,252,1)";
const DARK_BACKGROUND_ROOT = "rgba(4,4,4,1)";

test("theme change propagates to settings and, via client-side nav, to the thoughts list", async ({
  page,
}) => {
  const nav = PageModel.nav(page);
  const settings = PageModel.settings(page);
  const list = PageModel.listThoughts(page);

  await page.goto("/v2?onboarded=1");
  await nav.settings.click();
  await expect(settings.screenRoot).toBeVisible();

  await settings.themeLight.click();
  await expect(settings.screenRoot).toHaveCSS(
    "background-color",
    LIGHT_BACKGROUND_ROOT
  );

  await settings.themeDark.click();
  await expect(settings.screenRoot).toHaveCSS(
    "background-color",
    DARK_BACKGROUND_ROOT
  );

  // no page.goto() here — client-side nav only, proving the shared state
  // (not a reload) is what the next screen renders from.
  await nav.thoughtsList.click();
  await expect(list.screenRoot).toBeVisible();
  await expect(list.screenRoot).toHaveCSS(
    "background-color",
    DARK_BACKGROUND_ROOT
  );
});

test("locale change propagates to settings and, via client-side nav, to the thoughts list", async ({
  page,
}) => {
  const nav = PageModel.nav(page);
  const settings = PageModel.settings(page);
  const list = PageModel.listThoughts(page);

  await page.goto("/v2?onboarded=1");
  await nav.settings.click();
  await expect(settings.screenRoot).toBeVisible();

  // Assert the deterministic starting point explicitly — don't assume the
  // machine running Playwright reports English as its locale.
  await settings.localePicker.selectOption({ label: "English" });
  await expect(settings.historyAlternative).toHaveText("Alternative Thought");
  await expect(settings.historyAutomatic).toHaveText("Automatic Thought");

  await settings.localePicker.selectOption({ label: "Deutsch" });
  await expect(settings.historyAlternative).toHaveText("Alternativer Gedanke");
  await expect(settings.historyAutomatic).toHaveText("Automatischer Gedanke");

  // no page.goto() here — client-side nav only.
  await nav.thoughtsList.click();
  await expect(list.screenRoot).toBeVisible();
  await expect(page.getByText("Noch keine Gedanken")).toBeVisible();
});

test("history-label change re-projects an existing thought's displayed label", async ({
  page,
}) => {
  const nav = PageModel.nav(page);
  const form = PageModel.createThought(page);
  const settings = PageModel.settings(page);
  const list = PageModel.listThoughts(page);
  const automaticMarker = "AUTOMATIC_MARKER_this crashed my day";
  const alternativeMarker = "ALTERNATIVE_MARKER_a calmer reframe";

  await page.goto("/v2?onboarded=1");
  await form.automaticThought.fill(automaticMarker);
  await page.getByLabel("2 of 4").click();
  await page.getByLabel("3 of 4").click();
  await page.getByLabel("4 of 4").click();
  await form.alternativeThought.fill(alternativeMarker);
  await form.submitButton.click();
  await page.waitForURL(/\/v2\/thoughts\/[0-9a-f]{8}/);

  // no page.goto() here — client-side nav only, from the just-created
  // thought's own view page back into settings.
  await nav.settings.click();
  await expect(settings.screenRoot).toBeVisible();
  await settings.historyAlternative.click();

  await nav.thoughtsList.click();
  await expect(list.firstThought).toContainText(alternativeMarker);
  await expect(list.firstThought).not.toContainText(automaticMarker);

  await nav.settings.click();
  await settings.historyAutomatic.click();

  await nav.thoughtsList.click();
  await expect(list.firstThought).toContainText(automaticMarker);
  await expect(list.firstThought).not.toContainText(alternativeMarker);
});
