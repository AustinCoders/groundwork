"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from "react";
import { openAuth } from "@/lib/account/config";
import { useAccount } from "@/lib/account/session";
import { ExtractError, MAX_FILE_BYTES, MAX_PAGES, extractFile, fileKind, type Extracted } from "@/lib/resume/extract";
import { forStorage } from "@/lib/resume/forStorage";
import { JD_LIMIT } from "@/lib/resume/limits";
import { PENDING_MINUTES, clearPending, readPending, savePending } from "@/lib/resume/pending";
import { peekResume, type ResumePeek } from "@/lib/resume/peek";
import { RemoteError, analyseOnServer } from "@/lib/resume/remote";
import {
  MAX_SAVED,
  deleteResume,
  listResumes,
  openResume,
  saveMarks,
  saveResume,
  updateAnalysis,
  type Marks,
  type SavedResume,
} from "@/lib/resume/store";
import type { ResumeAnalysis } from "@/lib/resume/types";
import { Results } from "./Results";
import styles from "./resume.module.css";

type Stage = "idle" | "reading" | "peeking" | "thinking" | "saving";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  reading: "Reading the file…",
  thinking: "Matching it against 300+ interview questions…",
  peeking: "Reading the sections…",
  saving: "Saving to your account…",
};

const FILE_PROBLEM = "Something went wrong while reading the file. Try exporting it again as a PDF.";

interface Current {
  uid: number;
  id: string | null;
  title: string;
  analysis: ResumeAnalysis;
  read: Extracted | null;
  jd: string;
}

function sizeLabel(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function dateLabel(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function titleOf(file: File): string {
  return file.name.replace(/\.(pdf|docx)$/i, "") || "Resume";
}

function fileProblem(file: File): string | null {
  if (!fileKind(file)) return "Upload a PDF or a Word (.docx) file. Older .doc files need to be saved as .docx first.";
  if (file.size > MAX_FILE_BYTES) return "That file is over 2 MB. A resume is usually under 300 KB.";
  return null;
}

function problemOf(caught: unknown): string {
  if (caught instanceof ExtractError || caught instanceof RemoteError) return caught.message;
  return FILE_PROBLEM;
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function DropZone({
  file,
  busy,
  onPick,
}: {
  file: File | null;
  busy: boolean;
  onPick: (file: File | undefined) => void;
}) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    onPick(event.dataTransfer.files?.[0]);
  }

  return (
    <label
      htmlFor={inputId}
      className={styles.drop}
      data-dragging={dragging || undefined}
      data-has-file={file ? true : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <span className={styles.dropIcon} aria-hidden="true">
        {file ? "✓" : "↑"}
      </span>
      {file ? (
        <span className={styles.dropText}>
          <strong>{file.name}</strong>
          <span>{sizeLabel(file.size)} · click to choose another</span>
        </span>
      ) : (
        <span className={styles.dropText}>
          <strong>Drop your resume here, or click to choose</strong>
          <span>PDF or .docx, up to 2 MB and {MAX_PAGES} pages</span>
        </span>
      )}
      <input
        key={file ? "picked" : "empty"}
        id={inputId}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className={styles.fileInput}
        onChange={(e) => onPick(e.target.files?.[0])}
        disabled={busy}
      />
    </label>
  );
}

function StageButton({
  stage,
  disabled,
  label,
  onClick,
}: {
  stage: Stage;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  const busy = stage !== "idle";
  return (
    <button type="button" className={styles.primary} disabled={disabled || busy} onClick={onClick}>
      {busy ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {STAGE_LABEL[stage]}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function Locked({
  title,
  peek,
  accountsOff,
  onForget,
}: {
  title: string;
  peek: ResumePeek;
  accountsOff: boolean;
  onForget: () => void;
}) {
  const facts = [
    plural(peek.pages, "page"),
    peek.roles > 0 ? plural(peek.roles, "role") : null,
    peek.years ? `about ${peek.years} years of experience` : null,
    peek.projects > 0 ? plural(peek.projects, "project") : null,
    peek.bullets > 0 ? plural(peek.bullets, "bullet") : null,
  ].filter(Boolean);
  return (
    <section className={styles.lockCard} aria-labelledby="resume-locked-title">
      <p className={styles.kicker}>Read in your browser · {title}</p>
      <h2 id="resume-locked-title" className={styles.lockTitle}>
        {accountsOff ? "Your resume is read." : "Your resume is read. Sign in to get your questions."}
      </h2>
      <p className={styles.lockFacts}>We found {facts.join(", ")}.</p>
      {peek.skills.length > 0 && (
        <div className={styles.skillRow} aria-label="Skills we found">
          {peek.skills.slice(0, 10).map((name) => (
            <span key={name} className={styles.skillChip}>
              {name}
            </span>
          ))}
          {peek.skills.length > 10 && <span className={styles.skillMore}>+{peek.skills.length - 10} more</span>}
        </div>
      )}
      <ul className={styles.lockList}>
        <li>The questions an interviewer will ask about your own bullets, numbers, roles and gaps</li>
        <li>Real interview questions for each skill above, with model answers</li>
        <li>The fixes worth making before you apply, and where to prepare</li>
        <li>Paste a company&apos;s job description and all of it matches that job</li>
      </ul>
      {accountsOff ? (
        <p className={styles.note}>
          Sign-in is not set up on this copy of the site, so the questions cannot be built here.
        </p>
      ) : (
        <>
          <div className={styles.introActions}>
            <button type="button" className={styles.primary} onClick={() => openAuth("sign-up", "/resume")}>
              Create a free account
            </button>
            <button type="button" className={styles.ghost} onClick={() => openAuth("sign-in", "/resume")}>
              Sign in
            </button>
          </div>
          <p className={styles.note}>
            Nothing has been sent anywhere yet. What was read stays in this browser for {PENDING_MINUTES} minutes so it
            is waiting for you after you sign in.{" "}
            <button type="button" className={styles.textBtn} onClick={onForget}>
              Remove it now
            </button>
          </p>
        </>
      )}
    </section>
  );
}

function Guest({ sample, accountsOff }: { sample: ResumeAnalysis; accountsOff: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; peek: ResumePeek } | null>(null);
  const [sampleMarks, setSampleMarks] = useState<Marks>({});

  useEffect(() => {
    let live = true;
    void Promise.resolve().then(() => {
      const waiting = readPending();
      if (!live || !waiting) return;
      try {
        setPreview({ title: waiting.title, peek: peekResume(waiting.read) });
      } catch {
        clearPending();
      }
    });
    return () => {
      live = false;
    };
  }, []);

  function pick(next: File | undefined) {
    setError(null);
    if (!next) return;
    const problem = fileProblem(next);
    if (problem) setError(problem);
    else setFile(next);
  }

  async function read() {
    if (!file || stage !== "idle") return;
    setError(null);
    try {
      setStage("reading");
      const extracted = await extractFile(file);
      setStage("peeking");
      const peek = peekResume(extracted);
      const title = titleOf(file);
      if (!accountsOff) savePending(title, extracted);
      setPreview({ title, peek });
      setFile(null);
      window.requestAnimationFrame(() =>
        document.getElementById("resume-guest-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (caught) {
      setError(problemOf(caught));
    } finally {
      setStage("idle");
    }
  }

  function forget() {
    clearPending();
    setPreview(null);
  }

  return (
    <>
      <div className={styles.introCard}>
        <ol className={styles.steps}>
          <li>
            <span>1</span>Upload your resume as a PDF or Word file. No account needed to start.
          </li>
          <li>
            <span>2</span>Sign in to get the questions your resume invites, the fixes worth making, and where to
            prepare.
          </li>
          <li>
            <span>3</span>Paste the job description of the company you are applying to, and the result matches it.
          </li>
        </ol>
      </div>

      <div className={styles.guest}>
        <div className={styles.uploadCard}>
          <h2 className={styles.cardTitle}>Check your resume</h2>
          <DropZone file={file} busy={stage !== "idle"} onPick={pick} />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <StageButton stage={stage} disabled={!file} label="Read my resume" onClick={() => void read()} />
          <p className={styles.note}>Free, and no AI service sees it. The file is read in your browser.</p>
        </div>

        <div id="resume-guest-result" className={styles.main}>
          {preview ? (
            <Locked title={preview.title} peek={preview.peek} accountsOff={accountsOff} onForget={forget} />
          ) : (
            <div className={styles.emptyResult}>
              <p className={styles.emptyTitle}>What you will get</p>
              <p>
                Questions about your own bullets and numbers, the roles and gaps an interviewer will ask about, real
                questions for each skill you list, and the fixes worth making before you apply. See the sample below.
              </p>
            </div>
          )}
        </div>
      </div>

      <p id="resume-sample" className={styles.sampleLabel}>
        Below is the real result for a sample resume and job description. Everything in it works, but nothing is saved.
      </p>
      <Results
        analysis={sample}
        marks={sampleMarks}
        sample
        onMark={(id, mark) =>
          setSampleMarks((now) => {
            const next = { ...now };
            if (mark) next[id] = mark;
            else delete next[id];
            return next;
          })
        }
      />
    </>
  );
}

function Tailor({ current, busy, onApply }: { current: Current; busy: boolean; onApply: (jd: string) => void }) {
  const jdId = useId();
  const [jd, setJd] = useState(current.jd);
  const applied = current.jd.trim().length > 0;
  const changed = jd.trim() !== current.jd.trim();

  if (!current.read) {
    return (
      <p className={styles.tailorNote}>
        To match this saved result to a job description, upload the same file again and paste the job description after
        it is read.
      </p>
    );
  }

  return (
    <div className={styles.tailorCard}>
      <label htmlFor={jdId} className={styles.label}>
        {applied ? "Matched to this job description" : "Applying to a company? Paste its job description"}
        <span className={styles.counter}>
          {jd.length}/{JD_LIMIT}
        </span>
      </label>
      <textarea
        id={jdId}
        className={styles.jd}
        value={jd}
        maxLength={JD_LIMIT}
        rows={applied ? 3 : 5}
        placeholder="Paste the job description. The questions, fixes and study plan change to match the skills it asks for."
        onChange={(e) => setJd(e.target.value)}
        disabled={busy}
      />
      <div className={styles.tailorActions}>
        <button
          type="button"
          className={styles.primary}
          disabled={busy || !jd.trim() || !changed}
          onClick={() => onApply(jd)}
        >
          {busy ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Matching…
            </>
          ) : applied ? (
            "Update the match"
          ) : (
            "Match to this job"
          )}
        </button>
        {applied && (
          <button
            type="button"
            className={styles.ghost}
            disabled={busy}
            onClick={() => {
              setJd("");
              onApply("");
            }}
          >
            Remove the job description
          </button>
        )}
      </div>
    </div>
  );
}

export function ResumeLab({ sample }: { sample: ResumeAnalysis }) {
  const account = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [keep, setKeep] = useState(true);
  const [stage, setStage] = useState<Stage>("idle");
  const [tailoring, setTailoring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedResume[] | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const [confirming, setConfirming] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const marksTimer = useRef(0);
  const nextUid = useRef(0);
  const signedIn = account.status === "in";

  const refresh = useCallback(async () => {
    const result = await listResumes();
    if (result.ok) setSaved(result.value);
    else setError(result.error);
    return result;
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    void listResumes().then((result) => {
      if (!live) return;
      if (result.ok) setSaved(result.value);
      else setError(result.error);
    });
    if (readPending()) void restore(() => live);
    return () => {
      live = false;
    };
  }, [signedIn]);

  useEffect(() => () => window.clearTimeout(marksTimer.current), []);

  async function restore(live: () => boolean = () => true) {
    const waiting = readPending();
    if (!waiting) {
      setRestoreError(null);
      return;
    }
    setRestoring(true);
    setRestoreError(null);
    try {
      const analysis = await analyseOnServer(waiting.read, "");
      if (!live()) return;
      clearPending();
      setCurrent({ uid: ++nextUid.current, id: null, title: waiting.title, analysis, read: waiting.read, jd: "" });
      setMarks({});
      setNotice("Here is the resume you uploaded before signing in. Save it to keep it in your account.");
    } catch (caught) {
      if (live()) setRestoreError(problemOf(caught));
    } finally {
      if (live()) setRestoring(false);
    }
  }

  function pick(next: File | undefined) {
    setError(null);
    setNotice(null);
    if (!next) return;
    const problem = fileProblem(next);
    if (problem) setError(problem);
    else setFile(next);
  }

  async function store(title: string, analysis: ResumeAnalysis): Promise<string | null> {
    const result = await saveResume(title, forStorage(analysis));
    if (result.ok) {
      void refresh();
      return result.value;
    }
    setNotice(`${result.error} The result below is still yours to use; it just is not saved.`);
    return null;
  }

  async function check() {
    if (!file || stage !== "idle") return;
    setError(null);
    setNotice(null);
    try {
      setStage("reading");
      const extracted = await extractFile(file);
      setStage("thinking");
      const analysis = await analyseOnServer(extracted, "");
      const title = titleOf(file);
      let id: string | null = null;
      if (keep) {
        setStage("saving");
        id = await store(title, analysis);
      }
      setCurrent({ uid: ++nextUid.current, id, title, analysis, read: extracted, jd: "" });
      setMarks({});
      setFile(null);
      window.requestAnimationFrame(() =>
        document.getElementById("resume-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (caught) {
      setError(problemOf(caught));
    } finally {
      setStage("idle");
    }
  }

  async function saveCurrent() {
    if (!current || current.id || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const id = await store(current.title, current.analysis);
    setSaving(false);
    if (!id) return;
    setCurrent({ ...current, id });
    if (Object.keys(marks).length > 0) void saveMarks(id, marks);
    setNotice("Saved to your account.");
  }

  async function tailor(jd: string) {
    if (!current?.read || tailoring) return;
    setTailoring(true);
    setError(null);
    setNotice(null);
    try {
      const analysis = await analyseOnServer(current.read, jd);
      const next: Current = { ...current, analysis, jd: jd.trim() };
      setCurrent(next);
      if (next.id) {
        const result = await updateAnalysis(next.id, forStorage(analysis));
        if (!result.ok) setError(result.error);
      }
      setNotice(
        jd.trim()
          ? analysis.missing.length > 0
            ? `Matched. The job asks for ${plural(analysis.missing.length, "skill")} your resume does not show; see the fixes and study plan.`
            : "Matched. Your resume covers every skill we spotted in the job description."
          : "Removed the job description."
      );
    } catch (caught) {
      setError(caught instanceof RemoteError ? caught.message : "Could not match the job description. Try again.");
    } finally {
      setTailoring(false);
    }
  }

  async function open(item: SavedResume) {
    setError(null);
    setNotice(null);
    const result = await openResume(item.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCurrent({
      uid: ++nextUid.current,
      id: item.id,
      title: item.title,
      analysis: result.value.analysis,
      read: null,
      jd: "",
    });
    setMarks(result.value.marks);
  }

  async function remove(item: SavedResume) {
    setConfirming(null);
    const result = await deleteResume(item.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (current?.id === item.id) {
      setCurrent(null);
      setMarks({});
    }
    setNotice(`Deleted “${item.title}” and everything saved with it.`);
    void refresh();
  }

  function mark(id: string, value: "known" | "fixed" | null) {
    const next = { ...marks };
    if (value) next[id] = value;
    else delete next[id];
    setMarks(next);
    const docId = current?.id;
    if (!docId) return;
    window.clearTimeout(marksTimer.current);
    marksTimer.current = window.setTimeout(() => {
      void saveMarks(docId, next).then((result) => {
        if (!result.ok) setError(result.error);
      });
    }, 700);
  }

  if (account.status === "loading") return <div className={styles.wait} aria-busy="true" />;
  if (!signedIn) return <Guest sample={sample} accountsOff={account.status === "off"} />;

  const full = (saved?.length ?? 0) >= MAX_SAVED;
  const busy = stage !== "idle";

  return (
    <div className={styles.lab}>
      <aside className={styles.side}>
        <div className={styles.uploadCard}>
          <h2 className={styles.cardTitle}>Check a resume</h2>
          <DropZone file={file} busy={busy} onPick={pick} />
          <label className={styles.keep}>
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} disabled={busy || full} />
            <span>
              Save the result to my account
              <small>
                {full
                  ? `You have ${MAX_SAVED} saved. Delete one to save another.`
                  : "Only you can see it. The file itself, your phone number and email are not stored."}
              </small>
            </span>
          </label>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className={styles.ok} role="status">
              {notice}
            </p>
          )}
          <StageButton
            stage={stage}
            disabled={!file}
            label="Find my interview questions"
            onClick={() => void check()}
          />
          <p className={styles.note}>
            No AI service sees your resume. The text read from it is checked on our server and not kept unless you save
            the result. Add a job description after it is read.
          </p>
        </div>

        <div className={styles.savedCard}>
          <h2 className={styles.cardTitle}>
            Saved <span className={styles.counter}>{saved ? `${saved.length}/${MAX_SAVED}` : ""}</span>
          </h2>
          {saved === null ? (
            <p className={styles.note}>Loading…</p>
          ) : saved.length === 0 ? (
            <p className={styles.note}>Nothing saved yet. Results you keep appear here.</p>
          ) : (
            <ul className={styles.savedList}>
              {saved.map((item) => (
                <li key={item.id} data-active={current?.id === item.id || undefined}>
                  <button type="button" className={styles.savedOpen} onClick={() => void open(item)}>
                    <strong>{item.title}</strong>
                    <span>{dateLabel(item.createdAt)}</span>
                  </button>
                  {confirming === item.id ? (
                    <span className={styles.confirm}>
                      <button type="button" className={styles.dangerBtn} onClick={() => void remove(item)}>
                        Delete
                      </button>
                      <button type="button" className={styles.textBtn} onClick={() => setConfirming(null)}>
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.textBtn}
                      aria-label={`Delete ${item.title}`}
                      onClick={() => setConfirming(item.id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div id="resume-result" className={styles.main}>
        {current ? (
          <>
            <div className={styles.resultTitle}>
              <span>{current.title}</span>
              {current.jd && <span className={styles.jdTag}>matched to a job</span>}
              {!current.id && (
                <>
                  <span className={styles.unsaved}>not saved</span>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    disabled={saving || full}
                    title={full ? `You have ${MAX_SAVED} saved. Delete one to save another.` : undefined}
                    onClick={() => void saveCurrent()}
                  >
                    {saving ? "Saving…" : "Save to my account"}
                  </button>
                </>
              )}
            </div>
            <Tailor key={current.uid} current={current} busy={tailoring} onApply={(jd) => void tailor(jd)} />
            <Results key={current.uid} analysis={current.analysis} marks={marks} onMark={mark} />
          </>
        ) : restoring ? (
          <div className={styles.emptyResult} aria-busy="true">
            <p className={styles.emptyTitle}>
              <span className={styles.spinner} aria-hidden="true" /> Building your questions…
            </p>
            <p>This is the resume you uploaded before signing in.</p>
          </div>
        ) : restoreError ? (
          <div className={styles.emptyResult}>
            <p className={styles.emptyTitle}>Could not open the resume you uploaded</p>
            <p className={styles.error} role="alert">
              {restoreError}
            </p>
            <div className={styles.introActions}>
              <button type="button" className={styles.primary} onClick={() => void restore()}>
                Try again
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => {
                  clearPending();
                  setRestoreError(null);
                }}
              >
                Upload a different file
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyResult}>
            <p className={styles.emptyTitle}>Your questions will appear here</p>
            <p>
              Upload a resume on the left. You will get questions about your own bullets and numbers, the roles and gaps
              an interviewer will ask about, real questions for each skill you list, and the fixes worth making before
              you apply. Then paste a job description to match it to one company.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
