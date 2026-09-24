import Link from "next/link";
import { Shell } from "@/components/Shell";
import { GIT_BODY_HTML, GIT_SECTIONS } from "@/content/git-body";
import { GitContents } from "@/app/git/GitContents";
import { GitCodeCopy } from "@/app/git/GitCodeCopy";

const BODY_ID = "git-body";
export default function GitPage() {
  return (
    <Shell
      skipLabel="Skip to the content"
      variant="focused"
      topicId="git"
      sidebarExtra={<GitContents sections={GIT_SECTIONS} />}
    >
      <div id={BODY_ID} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: GIT_BODY_HTML }} />
      <GitCodeCopy containerId={BODY_ID} />

      <footer className="site-foot">
        <Link href="/">All topics</Link>
        <Link href="/notes">JS notes</Link>
      </footer>
    </Shell>
  );
}
