const BULK_TITLE = /rapid-fire|the rest of|every number on your resume|implementations they ask|say out loud/i;

export function isBulkTitle(title: string): boolean {
  return BULK_TITLE.test(title);
}
