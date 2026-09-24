import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export interface PageMeta {
  /** The page's own name, without the site name — the root layout's title
   *  template appends that. Keep it short enough to survive a search result. */
  title: string;
  description: string;
  /** Absolute path on the site. Becomes the canonical and the og:url, both of
   *  which metadataBase turns into absolute URLs. */
  path: string;
  type?: "website" | "article";
  /** false emits noindex while staying followable, for a page that exists for
   *  readers but has nothing a search result could usefully offer. */
  index?: boolean;
  publishedTime?: string;
  authors?: string[];
}

/**
 * One shape for every page's metadata. Before this, /problems, the level pages
 * and the interview book all inherited the homepage's Open Graph title and URL,
 * so every link to them previewed as the homepage.
 */
export function pageMetadata(o: PageMeta): Metadata {
  const full = `${o.title} · ${SITE_NAME}`;
  const type = o.type ?? "website";

  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: o.path },
    robots: o.index === false ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      title: full,
      description: o.description,
      url: o.path,
      siteName: SITE_NAME,
      ...(type === "article" && o.publishedTime ? { publishedTime: o.publishedTime } : {}),
      ...(type === "article" && o.authors ? { authors: o.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: o.description,
    },
  };
}
