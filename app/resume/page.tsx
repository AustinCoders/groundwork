import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { analyzeResume } from "@/lib/resume/analyze";
import { buildCatalogue } from "@/lib/resume/catalogue";
import { SAMPLE_JD, SAMPLE_RESUME_LINES } from "@/lib/resume/sample";
import { ResumeLab } from "./ResumeLab";
import styles from "./resume.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Resume lab: the interview questions your resume invites",
  description:
    "Upload your resume and get the questions interviewers will ask about your own bullets, numbers, roles and skills, plus the fixes worth making before you apply. Free, read in your browser.",
  path: "/resume",
});

export default function ResumePage() {
  const sample = analyzeResume({
    lines: [...SAMPLE_RESUME_LINES],
    pages: 1,
    jd: SAMPLE_JD,
    catalogue: buildCatalogue(),
    now: { y: 2026, m: 11 },
  });
  return (
    <PageFrame title="Resume lab" mark="✦" accent="purple" layout="reader" skipLabel="Skip to the resume lab">
      <div className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Interview prep · new</p>
          <h1 className={styles.title}>The questions your resume invites</h1>
          <p className={styles.sub}>
            Interviewers prepare from your resume. Upload yours and see what they will ask about your bullets, numbers,
            roles and skills, with real questions from the interview book, and the fixes worth making before you apply.
          </p>
        </header>
        <ResumeLab sample={sample} />
      </div>
    </PageFrame>
  );
}
