import { PageModel } from "@/e2e";
import { expect, test } from "@playwright/test";

test("redirect to intro page exactly once", async ({ page }) => {
  const intro = PageModel.intro(page);
  const form = PageModel.createThought(page);
  await page.goto("/v2");
  await page.waitForURL("/v2/help/intro?onboarded=1");
  await expect(intro.guideButton).toBeVisible();
  // no more redirects after the first one
  await page.goto("/v2");
  await expect(form.title).toBeVisible();
  await expect(intro.guideButton).not.toBeVisible();
});

test("query-param skips intro page", async ({ page }) => {
  const intro = PageModel.intro(page);
  const form = PageModel.createThought(page);
  await page.goto("/v2?onboarded=1");
  await expect(intro.guideButton).not.toBeVisible();
  await expect(form.title).toBeVisible();
});
