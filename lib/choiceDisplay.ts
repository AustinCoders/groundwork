const LETTER_A = 97;
const DIGIT_ONE = 49;

export function choiceLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function choiceIndexForKey(key: string, count: number): number | null {
  if (key.length !== 1) return null;
  const code = key.toLowerCase().charCodeAt(0);
  let index = -1;
  if (code >= LETTER_A && code < LETTER_A + 26) index = code - LETTER_A;
  else if (code >= DIGIT_ONE && code < DIGIT_ONE + 9) index = code - DIGIT_ONE;
  return index >= 0 && index < count ? index : null;
}

export function isCodeOnly(html: string): boolean {
  return /^\s*<code>[^<]*<\/code>\s*$/.test(html);
}
