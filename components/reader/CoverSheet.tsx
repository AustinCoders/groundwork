import Link from "next/link";
import type { NotesFile } from "@/content/types";

export function CoverSheet({ data, basePath }: { data: NotesFile; basePath: string }) {
  const written = data.chapters.filter((c) => c.ready).length;

  return (
    <section className="sheet cover" id="top">
      <h1>{data.meta.title}</h1>
      <p className="sub">{data.meta.subtitle}</p>
      <p className="lead">{data.meta.lead}</p>
      <div className="cover__meta">
        <span className="chip">
          {written} / {data.chapters.length} chapters written
        </span>
        <span className="chip">by {data.meta.author}</span>
        <span className="chip">updated {data.meta.updated}</span>
      </div>
      {data.hero?.figure && <div dangerouslySetInnerHTML={{ __html: data.hero.figure }} />}
      <nav className="toc" aria-label="Chapters">
        {data.chapters.map((ch) => (
          <Link key={ch.id} href={`${basePath}/${ch.id}`}>
            <b>{ch.num}</b>
            {ch.short}
          </Link>
        ))}
      </nav>
    </section>
  );
}
