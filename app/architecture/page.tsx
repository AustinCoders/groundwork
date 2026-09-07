import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { SectionNav } from "@/components/architecture/SectionNav";
import { ARCHITECTURE_BODY_HTML, ARCHITECTURE_SECTIONS } from "@/content/architecture";
import { SITE_URL } from "@/lib/site";

const title = "How this site is built — the architecture";
const description =
  "The system design of this site: the request path, the build, where state lives, how the playground runs code, and what would break first. Every number measured rather than estimated.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/architecture` },
  openGraph: { type: "article", title, description, url: `${SITE_URL}/architecture` },
};

export default function ArchitecturePage() {
  return (
    <Shell
      skipLabel="Skip to the content"
      variant="focused"
      sidebarExtra={<SectionNav sections={ARCHITECTURE_SECTIONS} label="Contents" />}
    >
      <div dangerouslySetInnerHTML={{ __html: ARCHITECTURE_BODY_HTML }} />

      <footer className="site-foot">
        <Link href="/">All topics</Link>
        <Link href="/system-design">System design notes</Link>
        <Link href="/interview/r8">The design round</Link>
      </footer>
    </Shell>
  );
}
