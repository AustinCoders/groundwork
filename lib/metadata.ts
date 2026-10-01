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

const SECTION_IMAGES: [prefix: string, image: string][] = [
  ["/notes", "/notes/opengraph-image"],
  ["/react", "/react/opengraph-image"],
  ["/dsa", "/dsa/opengraph-image"],
  ["/system-design", "/system-design/opengraph-image"],
  ["/git", "/git/opengraph-image"],
  ["/architecture", "/architecture/opengraph-image"],
  ["/interview", "/interview/opengraph-image"],
  ["/problems", "/problems/opengraph-image"],
];

function ogImageFor(path: string): string {
  const underLevel = /^\/level\/([^/]+)$/.exec(path);
  const sectioned = underLevel ? `/${underLevel[1]}` : path;
  const section = SECTION_IMAGES.find(([prefix]) => sectioned === prefix || sectioned.startsWith(`${prefix}/`));
  return section ? section[1] : "/opengraph-image";
}

export function pageMetadata(o: PageMeta): Metadata {
  const full = `${o.title} · ${SITE_NAME}`;
  const type = o.type ?? "website";
  const images = [ogImageFor(o.path)];

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
      images,
      ...(type === "article" && o.publishedTime ? { publishedTime: o.publishedTime } : {}),
      ...(type === "article" && o.authors ? { authors: o.authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: o.description,
      images,
    },
  };
}
