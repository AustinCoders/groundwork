import { describe, expect, it } from "vitest";
import { EMPTY_EXTRAS, extrasProblems, extrasToMetadata, readExtras } from "@/lib/account/profileExtras";

describe("profile extras", () => {
  it("reads only known fields, trims them and falls back to blue", () => {
    expect(readExtras({ headline: "  Dev  ", avatar_color: "pink", github: 7 })).toEqual({
      ...EMPTY_EXTRAS,
      headline: "Dev",
    });
    expect(readExtras(null)).toEqual(EMPTY_EXTRAS);
    expect(readExtras({ avatar_color: "green" }).avatarColor).toBe("green");
  });

  it("drops the @ from a GitHub name before saving", () => {
    expect(extrasToMetadata({ ...EMPTY_EXTRAS, github: "@ada-codes" }).github).toBe("ada-codes");
  });

  it("adds https to an address typed without it", () => {
    expect(extrasToMetadata({ ...EMPTY_EXTRAS, website: "ada.dev" }).website).toBe("https://ada.dev");
    expect(extrasProblems({ ...EMPTY_EXTRAS, linkedin: "linkedin.com/in/ada" })).toEqual({});
  });

  it("accepts a plain GitHub name, a LinkedIn profile address and an https site", () => {
    expect(
      extrasProblems({
        ...EMPTY_EXTRAS,
        github: "ada-codes",
        linkedin: "https://www.linkedin.com/in/ada-lovelace",
        website: "https://example.com/me",
      })
    ).toEqual({});
  });

  it("rejects a GitHub address, a LinkedIn page that is not a profile and a site without https", () => {
    const problems = extrasProblems({
      ...EMPTY_EXTRAS,
      github: "https://github.com/ada",
      linkedin: "https://www.linkedin.com/company/acme",
      website: "http://example.com",
    });
    expect(Object.keys(problems).sort()).toEqual(["github", "linkedin", "website"]);
  });
});
