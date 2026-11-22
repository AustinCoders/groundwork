import { describe, expect, it } from "vitest";
import { avatarStyle } from "@/lib/account/avatar";
import {
  AVATAR_ARTS,
  EMPTY_EXTRAS,
  extrasProblems,
  extrasToMetadata,
  isAvatarPath,
  readExtras,
} from "@/lib/account/profileExtras";

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

  it("keeps a known avatar character and drops anything else", () => {
    expect(readExtras({ avatar_art: "owl" }).avatarArt).toBe("owl");
    expect(readExtras({ avatar_art: "dragon" }).avatarArt).toBe("");
    expect(extrasToMetadata({ ...EMPTY_EXTRAS, avatarArt: "robot" }).avatar_art).toBe("robot");
    expect(new Set(AVATAR_ARTS).size).toBe(AVATAR_ARTS.length);
  });

  it("only trusts a photo path inside the user's own folder", () => {
    const id = "0b5f7a52-3c1e-4a8e-9d2f-6f1b2c3d4e5f";
    expect(isAvatarPath(`${id}/avatar-1763820000000.webp`)).toBe(true);
    expect(isAvatarPath(`${id}/avatar-1763820000000.jpg`)).toBe(true);
    expect(isAvatarPath(`${id}/../other/avatar-1763820000000.webp`)).toBe(false);
    expect(isAvatarPath(`${id}/avatar-1763820000000.svg`)).toBe(false);
    expect(readExtras({ avatar_path: "evil.webp" }).avatarPath).toBe("");
  });

  it("shows the photo over the colour and hides the initials under it", () => {
    expect(avatarStyle("blue")).toBeUndefined();
    expect(avatarStyle("green")).toEqual({ "--avatar": "var(--c-green)" });
    const style = avatarStyle("blue", 'https://x.test/a.webp?t="1"') as Record<string, string>;
    expect(style.backgroundImage).toBe('url("https://x.test/a.webp?t=1")');
    expect(style.color).toBe("transparent");
  });
});
