import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Crumbs } from "@/components/Crumbs";

export default function NotFound() {
  return (
    <Shell skipLabel="Skip to the content">
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Page not found" }]} />

      <section className="sheet hero">
        <div className="soon-stamp" aria-hidden="true">
          404
        </div>
        <span className="hero__kicker">this page isn&apos;t here</span>
        <h1>Nothing written on this page</h1>
        <p className="hero__lead">
          The link might be old, or the chapter may have moved. Everything that exists is on the shelf — start there and
          pick a topic.
        </p>
        <div className="hero__actions">
          <Link className="btn btn--primary btn--big" href="/">
            Back to all topics
          </Link>
          <Link className="btn btn--big" href="/dsa">
            Open the DSA notes
          </Link>
        </div>
      </section>
    </Shell>
  );
}
