import { expect, test, type Page } from "@playwright/test";

async function canvas(page: Page) {
  await page.goto("/whiteboard", { waitUntil: "networkidle" });
  const svg = page.locator("svg[role=application]");
  await expect(svg).toBeVisible();
  const box = (await svg.boundingBox())!;
  return { svg, box };
}

async function drag(page: Page, from: [number, number], to: [number, number]) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps: 6 });
  await page.mouse.up();
}

test("draws shapes, binds an arrow, undoes, and keeps the board after reload", async ({ page }) => {
  const { svg, box } = await canvas(page);
  const x = box.x;
  const y = box.y;

  await page.keyboard.press("r");
  await drag(page, [x + 200, y + 200], [x + 340, y + 290]);
  await page.keyboard.press("o");
  await drag(page, [x + 600, y + 200], [x + 740, y + 290]);
  await expect(svg).toHaveAttribute("aria-label", /2 elements/);

  await page.keyboard.press("a");
  await drag(page, [x + 270, y + 245], [x + 670, y + 245]);
  await expect(svg).toHaveAttribute("aria-label", /3 elements/);
  const arrow = page.locator("g[data-kind=arrow] path").first();
  const before = await arrow.getAttribute("d");

  await page.keyboard.press("v");
  await drag(page, [x + 680, y + 215], [x + 680, y + 415]);
  await expect.poll(() => arrow.getAttribute("d")).not.toBe(before);

  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => arrow.getAttribute("d")).toBe(before);

  await page.keyboard.press("n");
  await page.mouse.click(x + 400, y + 450);
  await expect(page.locator("textarea")).toBeFocused();
  await page.keyboard.type("Remember me");
  await page.keyboard.press("Escape");
  await expect(svg).toHaveAttribute("aria-label", /4 elements/);
  await expect(page.locator("svg text", { hasText: "Remember me" })).toBeVisible();

  await page.waitForTimeout(600);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("svg[role=application]")).toHaveAttribute("aria-label", /4 elements/);
});

test("exports a PNG and opens a share link as a new board", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const { box } = await canvas(page);
  await page.keyboard.press("d");
  await drag(page, [box.x + 200, box.y + 200], [box.x + 320, box.y + 300]);

  await page.getByRole("button", { name: "Boards and export" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("menuitem", { name: "PNG image" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.png$/);

  await page.getByRole("button", { name: "Boards and export" }).click();
  await page.getByRole("menuitem", { name: "Copy a share link" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("#board=");
  const url = await page.evaluate(() => navigator.clipboard.readText());

  const other = await context.newPage();
  await other.goto(url.replace(/^https?:\/\/[^/]+/, ""), { waitUntil: "networkidle" });
  await expect(other.locator("svg[role=application]")).toHaveAttribute("aria-label", /1 element/);
  await expect(other.getByRole("textbox", { name: "Board name" })).toHaveValue(/shared/);
});
