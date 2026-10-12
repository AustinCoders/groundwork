import { expect, type Page } from "@playwright/test";

export const CHUNKS = "**/_next/static/chunks/**";

export async function failToLoad(page: Page, from = "/privacy") {
  await page.unroute(CHUNKS);
  await page.goto(from, { waitUntil: "networkidle" });
  await page.route(CHUNKS, (route) => route.abort());
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("dialog", { name: /menu/ })
    .getByRole("link", { name: /^Review/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("This page hit an error");
}
