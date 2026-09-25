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
    page.getByRole("button", { name: "PNG image" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.png$/);

  await page.getByRole("button", { name: "Boards and export" }).click();
  await page.getByRole("button", { name: /Share this board/ }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("#board=");
  const url = await page.evaluate(() => navigator.clipboard.readText());

  const other = await context.newPage();
  await other.goto(url.replace(/^https?:\/\/[^/]+/, ""), { waitUntil: "networkidle" });
  await expect(other.locator("svg[role=application]")).toHaveAttribute("aria-label", /1 element/);
  await expect(other.getByRole("textbox", { name: "Board name" })).toHaveValue(/shared/);
});

test("has its own header and remembers the page layout", async ({ page }) => {
  await canvas(page);
  await expect(page.locator("#site-sidenav")).toHaveCount(0);
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Whiteboard" })).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Home|Back to/ })).toBeVisible();
  await page.getByRole("button", { name: "Boards and export" }).click();
  await page.getByRole("radio", { name: "Blueprint" }).click();
  await page.getByRole("radio", { name: "Roboto" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "blueprint");
  await expect(page.locator("html")).toHaveAttribute("data-font", "roboto");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("complementary", { name: "Board menu" })).toHaveCount(0);

  await page.getByRole("button", { name: "Page layout" }).click();
  await page.getByRole("tab", { name: "Technical" }).click();
  await page.getByRole("button", { name: "Isometric" }).click();
  await page.getByRole("tab", { name: "Colour" }).click();
  await page.getByRole("button", { name: "Blueprint" }).click();
  await page.getByRole("checkbox", { name: /Snap to the page/ }).uncheck();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Page layout" }).click();
  await expect(page.getByRole("tab", { name: "Technical" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "Isometric" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("checkbox", { name: /Snap to the page/ })).not.toBeChecked();
  await expect(page.locator("#board")).toHaveAttribute("data-tint", "blueprint");
});

test("templates, locking, grouping and the right-click menu", async ({ page }) => {
  const { svg, box } = await canvas(page);
  await page.getByRole("button", { name: "Flowchart" }).click();
  await expect(svg).toHaveAttribute("aria-label", /14 elements/);
  await page.keyboard.press("Escape");

  await page.keyboard.press("r");
  await drag(page, [box.x + 1000, box.y + 440], [box.x + 1100, box.y + 510]);
  await page.keyboard.press("ControlOrMeta+Shift+l");
  await page.keyboard.press("Delete");
  await expect(svg).toHaveAttribute("aria-label", /15 elements/);
  await expect(page.getByRole("status")).toContainText(/unlock/i);

  await page.mouse.click(box.x + 1005, box.y + 445, { button: "right" });
  await page.getByRole("menuitem", { name: /Unlock/ }).click();
  await page.mouse.click(box.x + 1005, box.y + 445, { button: "right" });
  await page.getByRole("menuitem", { name: /Delete/ }).click();
  await expect(svg).toHaveAttribute("aria-label", /14 elements/);

  await page.keyboard.press("s");
  await drag(page, [box.x + 80, box.y + 300], [box.x + 180, box.y + 380]);
  await expect(page.locator("g[data-kind=triangle]")).toHaveCount(1);
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toHaveCount(0);
});

test("an arrow's end can be dragged off one shape and onto another", async ({ page }) => {
  const { box } = await canvas(page);
  const at = (x: number, y: number): [number, number] => [box.x + x, box.y + y];
  await page.keyboard.press("r");
  await drag(page, at(200, 200), at(320, 280));
  await page.keyboard.press("o");
  await drag(page, at(600, 200), at(720, 280));
  await page.keyboard.press("d");
  await drag(page, at(600, 420), at(720, 520));
  await page.keyboard.press("a");
  await drag(page, at(260, 240), at(660, 240));
  const arrow = page.locator("g[data-kind=arrow] path").first();

  const end = (await page.locator("circle[data-end=end]").boundingBox())!;
  await drag(page, [end.x + end.width / 2, end.y + end.height / 2], at(660, 470));
  await page.keyboard.press("Escape");
  const before = await arrow.getAttribute("d");
  await page.keyboard.press("v");
  await drag(page, at(680, 490), at(680, 640));
  await expect.poll(() => arrow.getAttribute("d")).not.toBe(before);
});

test("new boards ask for a name and deleting one asks first", async ({ page }) => {
  const { svg, box } = await canvas(page);
  await page.keyboard.press("r");
  await drag(page, [box.x + 300, box.y + 300], [box.x + 400, box.y + 380]);

  await page.getByRole("button", { name: "Boards and export" }).click();
  await page.getByRole("button", { name: "+ New board" }).click();
  const dialog = page.getByRole("dialog", { name: "New board" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Name" }).fill("System design notes");
  await dialog.getByRole("button", { name: "Create board" }).click();
  await expect(page.getByRole("textbox", { name: "Board name" })).toHaveValue("System design notes");
  await expect(svg).toHaveAttribute("aria-label", /0 elements/);

  await page.getByRole("button", { name: "Boards and export" }).click();
  await page.getByRole("button", { name: "Delete My first board" }).click();
  const confirm = page.getByRole("dialog", { name: /Delete “My first board”/ });
  await expect(confirm).toContainText("1 item");
  await confirm.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Boards and export" }).click();
  await expect(page.getByRole("button", { name: "Delete My first board" })).toBeVisible();
  await page.getByRole("button", { name: "Delete My first board" }).click();
  await page.getByRole("button", { name: "Delete board" }).click();
  await page.getByRole("button", { name: "Boards and export" }).click();
  await expect(page.getByRole("button", { name: "Delete My first board" })).toHaveCount(0);
});
