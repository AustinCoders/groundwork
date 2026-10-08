import { expect, type Locator, type Page } from "@playwright/test";
import { pool } from "../content/dsa/quiz/dsa-binary-search";
import { poolChapterIds } from "../lib/quizPool";
import type { OrderQuestion, Question } from "../content/quiz-types";

export const CHAPTER_ID = "dsa-binary-search";
export const CHAPTER_PATH = `/dsa/${CHAPTER_ID}`;
const WRITTEN_DSA_CHAPTERS = ["dsa-hashing", "dsa-arrays-strings", "dsa-sorting-algorithms", "dsa-complexity-analysis"];
const WITH_A_POOL = new Set(poolChapterIds());
export const UNCHECKED_CHAPTER_ID = WRITTEN_DSA_CHAPTERS.find((id) => !WITH_A_POOL.has(id))!;
export const UNCHECKED_CHAPTER_PATH = `/dsa/${UNCHECKED_CHAPTER_ID}`;
export const QUIZ_KEY = "groundwork:quiz";
export const QUESTIONS = new Map<string, Question>(pool.questions.map((question) => [question.id, question]));

export type Way = "right" | "wrong";

export const island = (page: Page): Locator => page.locator("#check");

const fieldset = (page: Page): Locator => island(page).locator("fieldset[data-question]");

export async function press(page: Page, target: Locator, key = "Enter") {
  await target.focus();
  await page.keyboard.press(key);
}

export async function startCheck(page: Page) {
  const start = island(page).getByRole("button", { name: /^(Start the check|Check yourself|Check again|Try again)$/ });
  await press(page, start);
  await expect(fieldset(page)).toBeVisible();
}

export async function currentQuestion(page: Page): Promise<Question> {
  const id = await fieldset(page).getAttribute("data-question");
  const question = QUESTIONS.get(id ?? "");
  if (!question) throw new Error(`the page asked "${id}", which is not in binary search's pool`);
  return question;
}

export async function arrange(page: Page, question: OrderQuestion) {
  const ids = question.items.map((item) => item.id);
  const rows = island(page).locator("li[data-item]");
  for (let target = 0; target < ids.length; target++) {
    const order = await rows.evaluateAll((rowEls) => rowEls.map((row) => row.getAttribute("data-item")));
    for (let from = order.indexOf(ids[target]); from > target; from--) {
      await press(
        page,
        island(page)
          .locator(`[data-item="${ids[target]}"]`)
          .getByRole("button", { name: /^Move up/ })
      );
      await expect(rows.nth(from - 1)).toHaveAttribute("data-item", ids[target]);
    }
  }
}

async function choose(page: Page, ids: string[]) {
  for (const id of ids) {
    await press(page, island(page).locator(`[data-choice="${id}"] input`), "Space");
    await expect(island(page).locator(`[data-choice="${id}"] input`)).toBeChecked();
  }
}

export async function answer(page: Page, question: Question, way: Way) {
  if (question.kind === "order") {
    if (way === "right") await arrange(page, question);
    return;
  }
  if (question.kind === "multi") {
    const wrong = question.choices.find((choice) => !question.answers.includes(choice.id))!.id;
    await choose(page, way === "right" ? question.answers : [wrong]);
    return;
  }
  const wrong = question.choices.find((choice) => choice.id !== question.answer)!.id;
  await choose(page, [way === "right" ? question.answer : wrong]);
}

export async function checkAnswer(page: Page, way: Way) {
  await press(page, island(page).getByRole("button", { name: "Check answer" }));
  await expect(island(page).locator("[data-verdict]")).toHaveText(way === "right" ? "Correct" : "Not quite");
}

export async function advance(page: Page) {
  const button = island(page).getByRole("button", { name: /^(Next question|See result)$/ });
  const label = (await button.textContent()) ?? "";
  const before = await fieldset(page).getAttribute("data-question");
  await press(page, button);
  if (label === "See result") {
    await expect(island(page).locator("[data-result-heading]")).toBeVisible();
  } else {
    await expect(fieldset(page)).not.toHaveAttribute("data-question", before ?? "");
  }
}

export async function answerFive(page: Page, way: (question: Question, at: number) => Way): Promise<Question[]> {
  const asked: Question[] = [];
  for (let at = 0; at < 5; at++) {
    const question = await currentQuestion(page);
    const how = way(question, at);
    await answer(page, question, how);
    await checkAnswer(page, how);
    asked.push(question);
    await advance(page);
  }
  return asked;
}

export async function startOnOrderQuestion(page: Page): Promise<OrderQuestion> {
  for (let attempt = 0; attempt < 15; attempt++) {
    await startCheck(page);
    for (let at = 0; at < 5; at++) {
      const question = await currentQuestion(page);
      if (question.kind === "order") return question;
      await answer(page, question, "wrong");
      await checkAnswer(page, "wrong");
      await advance(page);
    }
  }
  throw new Error("15 draws in a row never asked the order question");
}

export async function storedQuiz(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), QUIZ_KEY);
}
