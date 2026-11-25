import { describe, expect, it } from "vitest";
import { backupCodesText, cleanBackupCode, formatBackupCode } from "@/lib/account/backupCodes";

describe("backup codes", () => {
  it("cleans what people type or paste", () => {
    const joined = ["home", "tree", "blue"].join("");
    expect(cleanBackupCode(" home TREE-blue ")).toBe(joined);
    expect(cleanBackupCode("home-tree-blue-extra")).toBe(joined);
    expect(cleanBackupCode("<script>")).toBe("script");
  });

  it("puts the dashes back while typing", () => {
    expect(formatBackupCode("ho")).toBe("ho");
    expect(formatBackupCode("homet")).toBe("home-t");
    expect(formatBackupCode("HOME TREE BLUE")).toBe("home-tree-blue");
  });

  it("writes a file that says what the codes are for and lists all ten", () => {
    const codes = Array.from({ length: 10 }, (_, i) => `aaaa-bbbb-ccc${i}`);
    const text = backupCodesText(codes, "ada@example.com", new Date("2026-11-25T10:00:00Z"));
    expect(text).toContain("ada@example.com");
    expect(text).toContain("2026-11-25");
    expect(text).toContain("works once");
    for (const code of codes) expect(text).toContain(code);
    expect(text.match(/^\s*\d+\. /gm)).toHaveLength(10);
  });
});
