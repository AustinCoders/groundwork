import type { Metadata } from "next";
import Script from "next/script";
import { RouteFade } from "@/components/RouteFade";
import { fontVariables } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/themeInitScript";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { TopicsReadyProvider } from "@/lib/topicReadiness";
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
  const readyTopicIds = Object.entries(topicStats())
    .filter(([, stat]) => stat.written > 0)
    .map(([id]) => id);

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
