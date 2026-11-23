"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from "react";
import { openAuth } from "@/lib/account/config";
import { useAccount } from "@/lib/account/session";
import { JD_LIMIT, analyzeResume, forStorage } from "@/lib/resume/analyze";
import { ExtractError, MAX_FILE_BYTES, MAX_PAGES, extractFile, fileKind, type Extracted } from "@/lib/resume/extract";
import { skillById } from "@/lib/resume/skills";
import { PENDING_MINUTES, clearPending, readPending, savePending } from "@/lib/resume/pending";
import {
  MAX_SAVED,
  deleteResume,
  listResumes,
  loadCatalogue,
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

type Stage = "idle" | "reading" | "thinking" | "saving";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  reading: "Reading the file…",
  thinking: "Matching it against 300+ interview questions…",
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

async function analyse(read: Extracted, jd: string): Promise<ResumeAnalysis> {
  const catalogue = await loadCatalogue();
  return analyzeResume({
    lines: read.lines,
    pages: read.pages,
    wideGaps: read.wideGaps,
    links: read.links,
    jd,
    catalogue,
  });
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

function Locked({ title, analysis, onForget }: { title: string; analysis: ResumeAnalysis; onForget: () => void }) {
  const high = analysis.fixes.filter((fix) => fix.severity === "high").length;
  const skills = analysis.parsed.skills.slice(0, 8);
  return (
    <section className={styles.lockCard} aria-labelledby="resume-locked-title">
      <p className={styles.kicker}>Read in your browser · {title}</p>
      <h2 id="resume-locked-title" className={styles.lockTitle}>
        Your result is ready. Sign in to open it.
      </h2>
      <div className={styles.lockStats}>
        <p>
          <strong>{analysis.questions.length}</strong>
          <span>{analysis.questions.length === 1 ? "interview question" : "interview questions"}</span>
        </p>
        <p>
          <strong>{analysis.fixes.length}</strong>
          <span>
            {analysis.fixes.length === 1 ? "fix" : "fixes"}
            {high > 0 ? `, ${high} important` : " to make"}
          </span>
        </p>
        <p>
          <strong>{analysis.study.length}</strong>
          <span>{analysis.study.length === 1 ? "skill to prepare" : "skills to prepare"}</span>
        </p>
      </div>
      {skills.length > 0 && (
        <div className={styles.skillRow} aria-label="Skills we found">
          {skills.map((id) => (
            <span key={id} className={styles.skillChip}>
              {skillById(id)?.name ?? id}
            </span>
          ))}
        </div>
      )}
      <div className={styles.lockPeek} aria-hidden="true">
        {[0, 1, 2].map((row) => (
          <span key={row} className={styles.lockLine} />
        ))}
      </div>
      <div className={styles.introActions}>
        <button type="button" className={styles.primary} onClick={() => openAuth("sign-up", "/resume")}>
          Create a free account to see it
        </button>
        <button type="button" className={styles.ghost} onClick={() => openAuth("sign-in", "/resume")}>
          Sign in
        </button>
      </div>
      <p className={styles.note}>
        After you sign in you can also paste the job description of the company you are applying to, and the questions
        and fixes change to match it. What was read stays in this browser for {PENDING_MINUTES} minutes so it is waiting
        for you after you sign in.{" "}
        <button type="button" className={styles.textBtn} onClick={onForget}>
          Remove it now
        </button>
      </p>
    </section>
  );
}

function Guest({ sample, accountsOff }: { sample: ResumeAnalysis; accountsOff: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; analysis: ResumeAnalysis } | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const [sampleMarks, setSampleMarks] = useState<Marks>({});

  useEffect(() => {
    if (accountsOff) return;
    const waiting = readPending();
    if (!waiting) return;
    let live = true;
    void analyse(waiting.read, "")
      .then((analysis) => {
        if (live) setPreview({ title: waiting.title, analysis });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [accountsOff]);

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
      setStage("thinking");
      const analysis = await analyse(extracted, "");
      const title = titleOf(file);
      if (!accountsOff) savePending(title, extracted);
      setPreview({ title, analysis });
      setMarks({});
      setFile(null);
      window.requestAnimationFrame(() =>
        document.getElementById("resume-guest-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (caught) {
      setError(caught instanceof ExtractError ? caught.message : FILE_PROBLEM);
    } finally {
      setStage("idle");
    }
  }

  function forget() {
    clearPending();
    setPreview(null);
  }

  function toggle(set: (fn: (now: Marks) => Marks) => void) {
    return (id: string, mark: "known" | "fixed" | null) =>
      set((now) => {
        const next = { ...now };
        if (mark) next[id] = mark;
        else delete next[id];
        return next;
      });
  }

  return (
    <>
      <div className={styles.introCard}>
        <ol className={styles.steps}>
          <li>
            <span>1</span>Upload your resume as a PDF or Word file. No account needed, and it is read in your browser.
          </li>
          <li>
            <span>2</span>Sign in to open the result: the questions your resume invites, fixes, and where to prepare.
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
          <p className={styles.note}>
            Free, no AI service involved. The file never leaves your browser.
            {accountsOff ? " Sign-in is not available on this copy of the site, so nothing is saved." : ""}
          </p>
        </div>

        <div id="resume-guest-result" className={styles.main}>
          {preview && accountsOff ? (
            <>
              <p className={styles.resultTitle}>
                {preview.title}
                <span className={styles.unsaved}>not saved</span>
              </p>
              <Results analysis={preview.analysis} marks={marks} onMark={toggle(setMarks)} />
            </>
          ) : preview ? (
            <Locked title={preview.title} analysis={preview.analysis} onForget={forget} />
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
      <Results analysis={sample} marks={sampleMarks} sample onMark={toggle(setSampleMarks)} />
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
  const marksTimer = useRef(0);
  const nextUid = useRef(0);
  const signedIn = account.status === "in" && account.mfa !== "needed";

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
    const waiting = readPending();
    if (waiting) {
      void analyse(waiting.read, "")
        .then((analysis) => {
          if (!live) return;
          clearPending();
          setCurrent({ uid: ++nextUid.current, id: null, title: waiting.title, analysis, read: waiting.read, jd: "" });
          setMarks({});
          setNotice("Here is the resume you uploaded before signing in. Save it to keep it in your account.");
        })
        .catch(() => undefined);
    }
    return () => {
      live = false;
    };
  }, [signedIn]);

  useEffect(() => () => window.clearTimeout(marksTimer.current), []);

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
      const analysis = await analyse(extracted, "");
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
      setError(caught instanceof ExtractError ? caught.message : FILE_PROBLEM);
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
      const analysis = await analyse(current.read, jd);
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
    } catch {
      setError("Could not match the job description. Try again.");
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
            Read in your browser. No AI service sees your resume. Add a job description after it is read.
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
