import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ErrorReporter } from "@/components/ErrorReporter";
import { RouteFade } from "@/components/RouteFade";
import { fontVariables } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/themeInitScript";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { TopicsReadyProvider } from "@/lib/topicReadiness";
import { TopicsNavProvider } from "@/lib/topicNav";
import { topicsNavWithStats, topicStats } from "@/lib/topicStats";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — the whole map`,
    // Every page supplies its own short name; the site name is appended here so
    // a search result says which site it came from without each page repeating it.
    template: `%s · ${SITE_NAME}`,
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
      </head>
      <body>
        {/* Where the Script docs put it. Next hoists a beforeInteractive script
            into <head> whatever its position; rendered inside a hand-written
            <head> instead, React meets a raw <script> while hydrating and warns
            that it will never run on the client. */}
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <TopicsNavProvider topics={topicsNavWithStats()}>
          <TopicsReadyProvider ids={readyTopicIds}>
            <RouteFade>{children}</RouteFade>
          </TopicsReadyProvider>
        </TopicsNavProvider>
        <ErrorReporter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
