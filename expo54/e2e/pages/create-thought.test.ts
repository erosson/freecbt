import { PageModel } from "@/e2e";
import { expect, test } from "@playwright/test";

test.skip("shows intro page", async ({ page }) => {
  // intro not yet implemented
  //await page.goto("/v2");
  //page.waitForURL("/v2/intro");
  //const intro = PageModel.intro(page);
  //await expect(intro.guideButton).toBeVisible();
});
test("renders and submits nonempty thought form", async ({ page }) => {
  const form = PageModel.createThought(page);
  const view = PageModel.viewThought(page);
  await page.goto("/v2");
  await expect.soft(form.title).toBeVisible();
  await expect.soft(form.automaticThought).toBeVisible();
  await form.automaticThought.fill("my automatic thought");
  await page.getByLabel("2 of 4").click();
  await form.distortionAllOrNothing.click();
  await page.getByLabel("3 of 4").click();
  await form.challenge.fill("my challenge");
  await page.getByLabel("4 of 4").click();
  await form.alternativeThought.fill("my alt thought");
  await form.submitButton.click();

  await page.waitForURL(/\/v2\/thoughts\/[0-9a-f]{8}/);
  await expect.soft(form.automaticThought).not.toBeVisible();
  await expect.soft(view.entry("my automatic thought")).toBeVisible();
  await expect
    .soft(view.automaticThought("my automatic thought"))
    .toBeVisible();
  await expect.soft(view.distortionAllOrNothing).toBeVisible();
  await expect.soft(view.challenge("my challenge")).toBeVisible();
  await expect.soft(view.alternativeThought("my alt thought")).toBeVisible();
  await expect.soft(view.missingEntries).not.toBeVisible();
});

test("renders and submits empty thought form", async ({ page }) => {
  const form = PageModel.createThought(page);
  const view = PageModel.viewThought(page);
  await page.goto("/v2");
  await expect.soft(form.title).toBeVisible();
  await expect.soft(form.automaticThought).toBeVisible();
  await form.submitButton.click();

  await page.waitForURL(/\/v2\/thoughts\/[0-9a-f]{8}/);
  await expect.soft(form.automaticThought).not.toBeVisible();
  await expect.soft(view.missingEntries).toHaveCount(4);
});
