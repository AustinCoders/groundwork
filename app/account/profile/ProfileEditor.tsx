"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AvatarFace, initials } from "@/components/account/AccountChip";
import { ART_NAMES, AvatarArt } from "@/components/account/AvatarArt";
import { Choice } from "@/components/account/Choice";
import { Completeness } from "@/components/account/Completeness";
import { SignInGate } from "@/components/account/SignInGate";
import { GOALS, LEVELS, ROLES } from "@/components/account/profileOptions";
import { avatarStyle } from "@/lib/account/avatar";
import { nameProblem } from "@/lib/account/errors";
import { AVATAR_ARTS, AVATAR_COLORS, extrasProblems, type EditableExtras } from "@/lib/account/profileExtras";
import {
  removeAvatar,
  updateProfile,
  uploadAvatar,
  updateProfileExtras,
  useAccount,
  type Experience,
  type Goal,
  type TargetRole,
} from "@/lib/account/session";
import { PhotoCropper } from "./PhotoCropper";
import styles from "./profile.module.css";

interface Draft extends EditableExtras {
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
  const { user, profile, photo } = useAccount();
  const [picked, setPicked] = useState<File | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoNote, setPhotoNote] = useState<{ ok: boolean; text: string } | null>(null);
  const start: Draft = {
    name: profile?.displayName || user?.name || "",
    goal: profile?.goal ?? null,
    experience: profile?.experience ?? null,
    role: profile?.targetRole ?? null,
    headline: user?.extras.headline ?? "",
    location: user?.extras.location ?? "",
    github: user?.extras.github ?? "",
    linkedin: user?.extras.linkedin ?? "",
    website: user?.extras.website ?? "",
    avatarColor: user?.extras.avatarColor ?? "blue",
    avatarArt: user?.extras.avatarArt ?? "",
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

  function choose(file: File | undefined) {
    setPhotoNote(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setPhotoNote({ ok: false, text: "Pick a JPG, PNG or WebP picture." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoNote({ ok: false, text: "That picture is over 10 MB. Pick a smaller one." });
      return;
    }
    setPicked(file);
  }

  async function upload(image: Blob): Promise<string | null> {
    const result = await uploadAvatar(image);
    if (!result.ok) return result.error;
    setPicked(null);
    setPhotoNote({ ok: true, text: "Photo updated." });
    return null;
  }

  async function dropPhoto() {
    setPhotoBusy(true);
    setPhotoNote(null);
    const result = await removeAvatar();
    setPhotoBusy(false);
    setPhotoNote(result.ok ? { ok: true, text: "Photo removed." } : { ok: false, text: result.error });
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
                style={avatarStyle(draft.avatarColor, photo)}
                key={`${draft.avatarColor}${draft.avatarArt}${photo ?? ""}`}
                aria-hidden="true"
              >
                <AvatarFace name={draft.name || "?"} art={draft.avatarArt} photo={photo} />
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
          <Completeness />
          <section className={styles.card} aria-labelledby="profile-look">
            <h2 id="profile-look" className={styles.cardTitle}>
              Photo, character and colour
            </h2>
            <div className={styles.photoRow}>
              <span className={styles.photoBig} style={avatarStyle(draft.avatarColor, photo)} aria-hidden="true">
                <AvatarFace name={draft.name || "?"} art={draft.avatarArt} photo={photo} />
              </span>
              <div className={styles.photoSide}>
                <div className={styles.photoActions}>
                  <label className={styles.uploadButton}>
                    {photo ? "Change photo" : "Upload a photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={styles.fileInput}
                      onChange={(e) => {
                        choose(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      className={styles.ghost}
                      disabled={photoBusy}
                      onClick={() => void dropPhoto()}
                    >
                      {photoBusy ? "Removing…" : "Remove photo"}
                    </button>
                  )}
                </div>
                <p className={styles.hint}>
                  JPG, PNG or WebP, up to 10 MB. It is cropped to a square and shrunk in your browser before it is
                  uploaded, and only you can see it.
                </p>
                {photoNote && (
                  <p className={photoNote.ok ? styles.ok : styles.error} role="status">
                    {photoNote.text}
                  </p>
                )}
              </div>
            </div>
            <p className={styles.label}>Character, shown when there is no photo</p>
            <div className={styles.arts} role="radiogroup" aria-label="Avatar character">
              <button
                type="button"
                role="radio"
                aria-checked={draft.avatarArt === ""}
                aria-label="Your initials"
                className={styles.artPick}
                style={avatarStyle(draft.avatarColor)}
                onClick={() => edit("avatarArt", "")}
              >
                <span>{initials(draft.name || "?")}</span>
              </button>
              {AVATAR_ARTS.map((art) => (
                <button
                  key={art}
                  type="button"
                  role="radio"
                  aria-checked={draft.avatarArt === art}
                  aria-label={ART_NAMES[art]}
                  title={ART_NAMES[art]}
                  className={styles.artPick}
                  style={avatarStyle(draft.avatarColor)}
                  onClick={() => edit("avatarArt", art)}
                >
                  <AvatarArt art={art} />
                </button>
              ))}
            </div>
            <p className={styles.label}>Colour</p>
            <div className={styles.colors} role="radiogroup" aria-label="Avatar colour">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={draft.avatarColor === color}
                  aria-label={COLOR_NAMES[color]}
                  className={styles.color}
                  style={{ "--swatch": `var(--c-${color})`, "--avatar": "var(--swatch)" } as CSSProperties}
                  onClick={() => edit("avatarColor", color)}
                >
                  {draft.avatarArt ? <AvatarArt art={draft.avatarArt} /> : <span>{initials(draft.name || "?")}</span>}
                </button>
              ))}
            </div>
            {picked && <PhotoCropper file={picked} onCancel={() => setPicked(null)} onDone={upload} />}
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
