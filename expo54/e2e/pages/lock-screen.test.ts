import { PageModel } from "@/e2e";
import { expect, Page, test } from "@playwright/test";

test("enforce lock screen on page reload", async ({ page }) => {
  const form = PageModel.createThought(page);
  const list = PageModel.listThoughts(page);
  const settings = PageModel.settings(page);
  const auth = PageModel.auth(page);
  const code = "6969";

  await page.goto("/v2");
  await form.navListThoughts.click();
  await list.navSettings.click();
  await settings.setPincode.click();
  await setAuth(page, code);
  await expect(settings.title).toBeVisible();

  await page.reload();
  await expect(settings.title).not.toBeVisible();
  await expect(auth.title).toBeVisible();
  await auth.input.fill(code);
  await auth.submitButton.click();
  await expect(settings.title).toBeVisible();
  await expect(auth.title).not.toBeVisible();
});

test("lock screen rejects bad auth", async ({ page }) => {
  const settings = PageModel.settings(page);
  const auth = PageModel.auth(page);
  const code = "6969";

  await page.goto("/v2/settings");
  await settings.setPincode.click();
  await setAuth(page, code);
  await expect(settings.title).toBeVisible();

  await page.reload();
  await expect(settings.title).not.toBeVisible();
  await expect(auth.title).toBeVisible();
  await auth.input.fill("0000");
  await auth.submitButton.click();
  await expect(settings.title).not.toBeVisible();
  await expect(auth.title).toBeVisible();
  await auth.input.fill(code);
  await auth.submitButton.click();
  await expect(settings.title).toBeVisible();
  await expect(auth.title).not.toBeVisible();
});

test("change and clear lock screen code", async ({ page }) => {
  const settings = PageModel.settings(page);
  const auth = PageModel.auth(page);
  const code = "6969";
  const code2 = "0420";

  // set pincode 1
  await page.goto("/v2/settings");
  await settings.setPincode.click();
  await setAuth(page, code);
  await expect(settings.title).toBeVisible();

  // reload page, pincode 1 is enforced
  await page.reload();
  await expect(settings.title).not.toBeVisible();
  await expect(auth.title).toBeVisible();
  await auth.input.fill(code);
  await auth.submitButton.click();
  await expect(settings.title).toBeVisible();
  await expect(auth.title).not.toBeVisible();

  // change to pincode 2
  await expect(settings.setPincode).not.toBeVisible();
  await settings.updatePincode.click();
  // not sure why it enforces the pincode here, but that's okay...? seems to be a dev-only page refresh thing.
  await expect(auth.title).toBeVisible();
  await auth.input.fill(code);
  await auth.submitButton.click();
  await setAuth(page, code2);
  await expect(settings.title).toBeVisible();

  // reload page, pincode 2 is enforced
  await page.reload();
  await expect(settings.title).not.toBeVisible();
  await expect(auth.title).toBeVisible();
  await auth.input.fill(code2);
  await auth.submitButton.click();
  await expect(settings.title).toBeVisible();
  await expect(auth.title).not.toBeVisible();

  // clear pincode
  await expect(settings.setPincode).not.toBeVisible();
  await settings.clearPincode.click();
  await expect(settings.title).toBeVisible();
  await expect(settings.setPincode).toBeVisible();

  // reload page, pincode is not enforced
  await page.reload();
  await expect(settings.title).toBeVisible();
  await expect(auth.title).not.toBeVisible();
});

// test.skip("enforce lock screen on alt-tab", async ({ page }) => {
// oops, background tabs aren't yet supported by playwright! "all pages are active."
// https://github.com/microsoft/playwright/issues/3570
// });

async function setAuth(page: Page, code: string) {
  const setAuth = PageModel.setAuth(page);
  const settings = PageModel.settings(page);

  // assumes we're already on the auth-setup page.
  // setup auth (pincode)
  await expect(setAuth.titleEnter).toBeVisible();
  await expect(setAuth.titleConfirm).not.toBeVisible();
  await expect(setAuth.input).toBeVisible();
  await setAuth.input.fill(code);
  await setAuth.submitButton.click();

  // confirm auth
  await expect(settings.title).not.toBeVisible();
  await expect(setAuth.titleEnter).not.toBeVisible();
  await expect(setAuth.titleConfirm).toBeVisible();
  await setAuth.input.fill(code);
  await setAuth.submitButton.click();

  // ended up in the right place?
  await expect(settings.title).toBeVisible();
  await expect(setAuth.titleEnter).not.toBeVisible();
  await expect(setAuth.titleConfirm).not.toBeVisible();
}
