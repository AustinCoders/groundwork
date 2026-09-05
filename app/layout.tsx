import type { Metadata } from "next";
import Script from "next/script";
import { RouteFade } from "@/components/RouteFade";
import { fontVariables } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/themeInitScript";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { TopicsReadyProvider } from "@/lib/topicReadiness";
import { topics } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — the whole map`,
    // Per-page titles already read "<Topic> — notes"; keep them as-authored.
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — the whole map`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — the whole map`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const readyTopicIds = [
    ...Object.entries(topicStats())
      .filter(([, stat]) => stat.written > 0)
      .map(([id]) => id),
    // Single-page readers (Git, Interview prep) have no chapter ladder, so
    // topicStats always reports them as 0 written — that's right for the
    // homepage's "N chapters written" count, but wrong here: a finished
    // single-page doc belongs in the sidebar's "Ready to read" list, not
    // buried under "More topics" as if it were still an outline.
    ...topics()
      .filter((t) => !t.levels && t.status === "ready")
      .map((t) => t.id),
  ];

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={fontVariables}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <TopicsReadyProvider ids={readyTopicIds}>
          <RouteFade>{children}</RouteFade>
        </TopicsReadyProvider>
      </body>
    </html>
  );
}
