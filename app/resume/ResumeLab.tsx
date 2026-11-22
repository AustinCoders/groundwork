"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from "react";
import { openAuth } from "@/lib/account/config";
import { useAccount } from "@/lib/account/session";
import { JD_LIMIT, analyzeResume, forStorage } from "@/lib/resume/analyze";
import { ExtractError, MAX_FILE_BYTES, MAX_PAGES, extractFile, fileKind } from "@/lib/resume/extract";
import {
  MAX_SAVED,
  deleteResume,
  listResumes,
  loadCatalogue,
  openResume,
  saveMarks,
  saveResume,
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

function sizeLabel(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function dateLabel(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Intro({ sample, accountsOff }: { sample: ResumeAnalysis; accountsOff: boolean }) {
  const [marks, setMarks] = useState<Marks>({});
  return (
    <>
      <div className={styles.introCard}>
        <ol className={styles.steps}>
          <li>
            <span>1</span>Upload your resume as a PDF or Word file. It is read in your browser.
          </li>
          <li>
            <span>2</span>Paste a job description if you have one. It is optional.
          </li>
          <li>
            <span>3</span>Get the questions your resume invites, fixes to make, and where to prepare.
          </li>
        </ol>
        <div className={styles.introActions}>
          {accountsOff ? (
            <p className={styles.note}>
              Sign-in is not available on this copy of the site, so you can only see the sample.
            </p>
          ) : (
            <>
              <button type="button" className={styles.primary} onClick={() => openAuth("sign-up", "/resume")}>
                Create a free account to try it
              </button>
              <button type="button" className={styles.ghost} onClick={() => openAuth("sign-in", "/resume")}>
                Sign in
              </button>
            </>
          )}
        </div>
        <p className={styles.note}>
          Free, no AI service involved: the file is read in your browser and only the result is saved, privately, to
          your account.
        </p>
      </div>
      <p id="resume-sample" className={styles.sampleLabel}>
        Below is the real result for a sample resume and job description. Everything in it works, but nothing is saved.
      </p>
      <Results
        analysis={sample}
        marks={marks}
        sample
        onMark={(id, mark) =>
          setMarks((now) => {
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

export function ResumeLab({ sample }: { sample: ResumeAnalysis }) {
  const account = useAccount();
  const inputId = useId();
  const jdId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [keep, setKeep] = useState(true);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState<SavedResume[] | null>(null);
  const [current, setCurrent] = useState<{ id: string | null; title: string; analysis: ResumeAnalysis } | null>(null);
  const [marks, setMarks] = useState<Marks>({});
  const [confirming, setConfirming] = useState<string | null>(null);
  const marksTimer = useRef(0);
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
    return () => {
      live = false;
    };
  }, [signedIn]);

  useEffect(() => () => window.clearTimeout(marksTimer.current), []);

  function pick(next: File | undefined) {
    setError(null);
    setNotice(null);
    if (!next) return;
    if (!fileKind(next)) {
      setError("Upload a PDF or a Word (.docx) file. Older .doc files need to be saved as .docx first.");
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setError("That file is over 2 MB. A resume is usually under 300 KB.");
      return;
    }
    setFile(next);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files?.[0]);
  }

  async function analyse() {
    if (!file || stage !== "idle") return;
    setError(null);
    setNotice(null);
    try {
      setStage("reading");
      const [read, catalogue] = await Promise.all([extractFile(file), loadCatalogue()]);
      setStage("thinking");
      const analysis = analyzeResume({
        lines: read.lines,
        pages: read.pages,
        wideGaps: read.wideGaps,
        links: read.links,
        jd,
        catalogue,
      });
      const title = file.name.replace(/\.(pdf|docx)$/i, "");
      let id: string | null = null;
      if (keep) {
        setStage("saving");
        const result = await saveResume(title, forStorage(analysis));
        if (result.ok) {
          id = result.value;
          void refresh();
        } else {
          setNotice(`${result.error} The result below is still yours to use; it just is not saved.`);
        }
      }
      setCurrent({ id, title, analysis });
      setMarks({});
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      window.requestAnimationFrame(() =>
        document.getElementById("resume-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    } catch (caught) {
      setError(
        caught instanceof ExtractError
          ? caught.message
          : "Something went wrong while reading the file. Try exporting it again as a PDF."
      );
    } finally {
      setStage("idle");
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
    setCurrent({ id: item.id, title: item.title, analysis: result.value.analysis });
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
  if (!signedIn) return <Intro sample={sample} accountsOff={account.status === "off"} />;

  const full = (saved?.length ?? 0) >= MAX_SAVED;
  const busy = stage !== "idle";

  return (
    <div className={styles.lab}>
      <aside className={styles.side}>
        <div className={styles.uploadCard}>
          <h2 className={styles.cardTitle}>Check a resume</h2>
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
              ref={inputRef}
              id={inputId}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className={styles.fileInput}
              onChange={(e) => pick(e.target.files?.[0])}
              disabled={busy}
            />
          </label>
          <label htmlFor={jdId} className={styles.label}>
            Job description <span className={styles.optional}>optional</span>
            <span className={styles.counter}>
              {jd.length}/{JD_LIMIT}
            </span>
          </label>
          <textarea
            id={jdId}
            className={styles.jd}
            value={jd}
            maxLength={JD_LIMIT}
            rows={5}
            placeholder="Paste the job description to see which of its skills your resume misses."
            onChange={(e) => setJd(e.target.value)}
            disabled={busy}
          />
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
          <button type="button" className={styles.primary} disabled={!file || busy} onClick={() => void analyse()}>
            {busy ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                {STAGE_LABEL[stage]}
              </>
            ) : (
              "Find my interview questions"
            )}
          </button>
          <p className={styles.note}>Read in your browser. No AI service sees your resume.</p>
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
            <p className={styles.resultTitle}>
              {current.title}
              {!current.id && <span className={styles.unsaved}>not saved</span>}
            </p>
            <Results key={current.id ?? current.title} analysis={current.analysis} marks={marks} onMark={mark} />
          </>
        ) : (
          <div className={styles.emptyResult}>
            <p className={styles.emptyTitle}>Your questions will appear here</p>
            <p>
              Upload a resume on the left. You will get questions about your own bullets and numbers, the roles and gaps
              an interviewer will ask about, real questions for each skill you list, and the fixes worth making before
              you apply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
