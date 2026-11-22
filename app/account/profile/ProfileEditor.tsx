"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { initials } from "@/components/account/AccountChip";
import { Choice } from "@/components/account/Choice";
import { SignInGate } from "@/components/account/SignInGate";
import { GOALS, LEVELS, ROLES } from "@/components/account/profileOptions";
import { avatarStyle } from "@/lib/account/avatar";
import { nameProblem } from "@/lib/account/errors";
import { AVATAR_COLORS, extrasProblems, type ProfileExtras } from "@/lib/account/profileExtras";
import {
  updateProfile,
  updateProfileExtras,
  useAccount,
  type Experience,
  type Goal,
  type TargetRole,
} from "@/lib/account/session";
import styles from "./profile.module.css";

interface Draft extends ProfileExtras {
  name: string;
  goal: Goal | null;
  experience: Experience | null;
  role: TargetRole | null;
}

const COLOR_NAMES: Record<string, string> = {
  blue: "Blue",
  purple: "Purple",
  green: "Green",
  orange: "Orange",
  red: "Red",
};

function labelOf<T extends string>(options: { value: T; label: string }[], value: T | null): string | null {
  return options.find((o) => o.value === value)?.label ?? null;
}

function same(a: Draft, b: Draft): boolean {
  return (Object.keys(a) as (keyof Draft)[]).every((key) => a[key] === b[key]);
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={styles.counter} data-near={value.length > max * 0.85 || undefined}>
      {value.length}/{max}
    </span>
  );
}

function Editor() {
  const { user, profile } = useAccount();
  const start: Draft = {
    name: profile?.displayName || user?.name || "",
    goal: profile?.goal ?? null,
    experience: profile?.experience ?? null,
    role: profile?.targetRole ?? null,
    ...(user?.extras ?? {
      headline: "",
      location: "",
      github: "",
      linkedin: "",
      website: "",
      avatarColor: "blue" as const,
    }),
  };
  const [saved, setSaved] = useState<Draft>(start);
  const [draft, setDraft] = useState<Draft>(start);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = !same(draft, saved);
  const problems = tried ? extrasProblems(draft) : {};
  const nameError = tried ? nameProblem(draft.name) : null;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!message?.ok) return;
    const id = window.setTimeout(() => setMessage(null), 2600);
    return () => window.clearTimeout(id);
  }, [message]);

  if (!user) return null;

  function edit<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((now) => ({ ...now, [key]: value }));
    setMessage(null);
  }

  async function save() {
    setTried(true);
    if (nameProblem(draft.name) || Object.keys(extrasProblems(draft)).length > 0) {
      setMessage({ ok: false, text: "Fix the fields marked in red, then save." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const basics = await updateProfile({
      displayName: draft.name,
      goal: draft.goal,
      experience: draft.experience,
      targetRole: draft.role,
    });
    const extras = basics.ok ? await updateProfileExtras(draft) : basics;
    setBusy(false);
    if (basics.ok && extras.ok) {
      setSaved(draft);
      setTried(false);
      setMessage({ ok: true, text: "Profile saved." });
    } else {
      setMessage({ ok: false, text: (!basics.ok && basics.error) || (!extras.ok && extras.error) || "Try again." });
    }
  }

  const github = draft.github.trim().replace(/^@/, "");
  const links = [
    github && { label: "GitHub", text: `github.com/${github}` },
    draft.linkedin.trim() && { label: "LinkedIn", text: "LinkedIn profile" },
    draft.website.trim() && { label: "Website", text: draft.website.trim().replace(/^https:\/\//, "") },
  ].filter(Boolean) as { label: string; text: string }[];
  const chips = [labelOf(GOALS, draft.goal), labelOf(LEVELS, draft.experience), labelOf(ROLES, draft.role)].filter(
    Boolean
  ) as string[];

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>
          <Link href="/account">Account</Link> <span aria-hidden="true">/</span> Profile
        </p>
        <h1 className={styles.title}>Edit your profile</h1>
        <p className={styles.sub}>
          How you show up on Groundwork, and what it should suggest for you. Everything here is optional except your
          name.
        </p>
      </header>

      <div className={styles.grid}>
        <aside className={styles.previewCol} aria-label="Preview">
          <div className={styles.preview}>
            <span className={styles.tape} aria-hidden="true" />
            <p className={styles.previewStrip}>Preview</p>
            <div className={styles.previewBody}>
              <span
                className={styles.previewAvatar}
                style={avatarStyle(draft.avatarColor)}
                key={draft.avatarColor}
                aria-hidden="true"
              >
                {initials(draft.name || "?")}
              </span>
              <p className={styles.previewName}>{draft.name.trim() || "Your name"}</p>
              <p className={styles.previewHeadline} data-empty={!draft.headline.trim() || undefined}>
                {draft.headline.trim() || "Add a headline, like “Frontend developer learning system design”"}
              </p>
              {draft.location.trim() && <p className={styles.previewMeta}>📍 {draft.location.trim()}</p>}
              {chips.length > 0 && (
                <ul className={styles.previewChips}>
                  {chips.map((chip) => (
                    <li key={chip}>{chip}</li>
                  ))}
                </ul>
              )}
              {links.length > 0 && (
                <ul className={styles.previewLinks}>
                  {links.map((link) => (
                    <li key={link.label}>
                      <b>{link.label}</b> {link.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <p className={styles.previewNote}>Only you can see your profile. Nothing here is public.</p>
        </aside>

        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <section className={styles.card} aria-labelledby="profile-look">
            <h2 id="profile-look" className={styles.cardTitle}>
              Avatar colour
            </h2>
            <div className={styles.colors} role="radiogroup" aria-label="Avatar colour">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={draft.avatarColor === color}
                  aria-label={COLOR_NAMES[color]}
                  className={styles.color}
                  style={{ "--swatch": `var(--c-${color})` } as CSSProperties}
                  onClick={() => edit("avatarColor", color)}
                >
                  <span>{initials(draft.name || "?")}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.card} aria-labelledby="profile-basics">
            <h2 id="profile-basics" className={styles.cardTitle}>
              The basics
            </h2>
            <label className={styles.field}>
              <span className={styles.label}>
                Name <Counter value={draft.name} max={60} />
              </span>
              <input
                className={styles.input}
                value={draft.name}
                maxLength={60}
                autoComplete="name"
                aria-invalid={nameError ? true : undefined}
                onChange={(e) => edit("name", e.target.value)}
              />
              {nameError && <span className={styles.error}>{nameError}</span>}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>
                Headline <Counter value={draft.headline} max={80} />
              </span>
              <input
                className={styles.input}
                value={draft.headline}
                maxLength={80}
                placeholder="Frontend developer learning system design"
                aria-invalid={problems.headline ? true : undefined}
                onChange={(e) => edit("headline", e.target.value)}
              />
              {problems.headline && <span className={styles.error}>{problems.headline}</span>}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Location</span>
              <input
                className={styles.input}
                value={draft.location}
                maxLength={60}
                autoComplete="address-level2"
                placeholder="Bengaluru, India"
                onChange={(e) => edit("location", e.target.value)}
              />
            </label>
          </section>

          <section className={styles.card} aria-labelledby="profile-goals">
            <h2 id="profile-goals" className={styles.cardTitle}>
              What you are working towards
            </h2>
            <p className={styles.hint}>Groundwork uses these to point you at the right chapters first.</p>
            <Choice
              legend="What brings you here?"
              options={GOALS}
              value={draft.goal}
              onChange={(v) => edit("goal", v)}
            />
            <Choice
              legend="How much have you built so far?"
              options={LEVELS}
              value={draft.experience}
              onChange={(v) => edit("experience", v)}
            />
            <Choice
              legend="Which role are you aiming for?"
              options={ROLES}
              value={draft.role}
              onChange={(v) => edit("role", v)}
            />
          </section>

          <section className={styles.card} aria-labelledby="profile-links">
            <h2 id="profile-links" className={styles.cardTitle}>
              Links
            </h2>
            <label className={styles.field}>
              <span className={styles.label}>GitHub username</span>
              <span className={styles.prefixed}>
                <span aria-hidden="true">github.com/</span>
                <input
                  className={styles.input}
                  value={draft.github}
                  maxLength={39}
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="your-username"
                  aria-invalid={problems.github ? true : undefined}
                  onChange={(e) => edit("github", e.target.value)}
                />
              </span>
              {problems.github && <span className={styles.error}>{problems.github}</span>}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>LinkedIn</span>
              <input
                className={styles.input}
                type="url"
                value={draft.linkedin}
                maxLength={100}
                inputMode="url"
                placeholder="linkedin.com/in/your-name"
                aria-invalid={problems.linkedin ? true : undefined}
                onChange={(e) => edit("linkedin", e.target.value)}
              />
              {problems.linkedin && <span className={styles.error}>{problems.linkedin}</span>}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Website</span>
              <input
                className={styles.input}
                type="url"
                value={draft.website}
                maxLength={200}
                inputMode="url"
                placeholder="your-site.dev"
                aria-invalid={problems.website ? true : undefined}
                onChange={(e) => edit("website", e.target.value)}
              />
              {problems.website && <span className={styles.error}>{problems.website}</span>}
            </label>
          </section>

          <div
            className={styles.bar}
            data-dirty={dirty || undefined}
            data-tone={message?.ok === false ? "error" : undefined}
          >
            <p role="status" aria-live="polite">
              {message ? message.text : dirty ? "You have unsaved changes." : "All changes saved."}
            </p>
            <div className={styles.barActions}>
              <button
                type="button"
                className={styles.ghost}
                disabled={!dirty || busy}
                onClick={() => {
                  setDraft(saved);
                  setTried(false);
                  setMessage(null);
                }}
              >
                Discard
              </button>
              <button type="submit" className={styles.primary} disabled={!dirty || busy}>
                {busy ? "Saving…" : "Save profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfileEditor() {
  return (
    <SignInGate feature="account">
      <EditorWhenLoaded />
    </SignInGate>
  );
}

function EditorWhenLoaded() {
  const { profile } = useAccount();
  return <Editor key={profile ? "loaded" : "empty"} />;
}
