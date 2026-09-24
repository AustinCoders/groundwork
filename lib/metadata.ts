import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  index?: boolean;
  publishedTime?: string;
  authors?: string[];
}

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
