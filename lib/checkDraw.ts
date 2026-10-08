import type { Question } from "@/content/quiz-types";

export const CHECK_SIZE = 5;
export const PASS_MARK = 4;

export type Answer = string | string[];

export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let at = copy.length - 1; at > 0; at--) {
    const swap = Math.floor(random() * (at + 1));
    [copy[at], copy[swap]] = [copy[swap], copy[at]];
  }
  return copy;
}

function isTrace(question: Question): boolean {
  return question.skill === "trace";
}

function isRecogniseOrComplexity(question: Question): boolean {
  return question.skill === "recognise" || question.skill === "complexity";
}

export function drawCheck(
  questions: readonly Question[],
  random: () => number,
  avoid: readonly string[] = []
): Question[] {
  if (questions.length <= CHECK_SIZE) return shuffled(questions, random);

  const previous = new Set(avoid);
  const fresh = shuffled(
    questions.filter((question) => !previous.has(question.id)),
    random
  );
  const repeated = shuffled(
    questions.filter((question) => previous.has(question.id)),
    random
  );
  const priority = [...fresh, ...repeated];

  const chosen: Question[] = [];
  const take = (question: Question | undefined) => {
    if (question && !chosen.includes(question)) chosen.push(question);
  };

  take(priority.find(isTrace));
  if (!chosen.some(isRecogniseOrComplexity)) take(priority.find(isRecogniseOrComplexity));
  for (const question of priority) {
    if (chosen.length >= CHECK_SIZE) break;
    take(question);
  }

  return shuffled(chosen, random);
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const wanted = new Set(right);
  return wanted.size === right.length && left.every((id) => wanted.has(id)) && new Set(left).size === left.length;
}

export function correctAnswer(question: Question): Answer {
  switch (question.kind) {
    case "multi":
      return question.answers;
    case "order":
      return question.items.map((item) => item.id);
    default:
      return question.answer;
  }
}

export function gradeAnswer(question: Question, answer: Answer | null | undefined): boolean {
  if (answer === null || answer === undefined) return false;
  switch (question.kind) {
    case "single":
    case "predict":
      return typeof answer === "string" && answer === question.answer;
    case "multi":
      return Array.isArray(answer) && sameSet(answer, question.answers);
    case "order": {
      if (!Array.isArray(answer) || answer.length !== question.items.length) return false;
      return question.items.every((item, at) => answer[at] === item.id);
    }
  }
}

export function passMark(total: number): number {
  return Math.min(PASS_MARK, total);
}

export function passes(score: number, total: number = CHECK_SIZE): boolean {
  return score >= passMark(total);
}

export function startingOrder(ids: readonly string[], random: () => number): string[] {
  if (ids.length < 2) return [...ids];
  const order = shuffled(ids, random);
  if (order.every((id, at) => id === ids[at])) order.push(order.shift()!);
  return order;
}
