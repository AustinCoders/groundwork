export type ThemeId = "ranking" | "limits" | "realtime" | "money" | "pipelines" | "platforms";

export interface Theme {
  id: ThemeId;
  name: string;
  blurb: string;
}

export const THEMES: readonly Theme[] = [
  { id: "ranking", name: "Feeds and ranking", blurb: "Top-K, leaderboards, scores that decay, ranked feeds" },
  { id: "limits", name: "Counting and limits", blurb: "Counters, rate limits, caps, sale-day traffic" },
  { id: "realtime", name: "Chat and real time", blurb: "Messaging, shared editing, dispatch" },
  { id: "money", name: "Orders and money", blurb: "Booking, ledgers, billing, split orders" },
  { id: "pipelines", name: "Streams and jobs", blurb: "Event pipelines, schedulers, notifications" },
  { id: "platforms", name: "Platforms and search", blurb: "Search, tagging, code hosting, updates" },
];

export const THEME_OF: Readonly<Record<string, ThemeId>> = {
  "meta-instagram-feed": "ranking",
  "meta-game-leaderboard": "ranking",
  "uber-top-k-popularity": "ranking",
  "atlassian-popular-feed": "ranking",
  "phonepe-qa-platform": "ranking",
  "google-distributed-counter": "limits",
  "microsoft-distributed-rate-limiter": "limits",
  "netflix-ad-frequency-capping": "limits",
  "amazon-big-sale-shopping": "limits",
  "google-url-shortener": "limits",
  "uber-messenger-chat": "realtime",
  "apple-imessage-backend": "realtime",
  "microsoft-collaborative-editor": "realtime",
  "uber-ride-hailing-dispatch": "realtime",
  "flipkart-ticket-booking": "money",
  "flipkart-transaction-ledger": "money",
  "flipkart-daily-subscription": "money",
  "razorpay-subscription-billing": "money",
  "swiggy-order-splitting": "money",
  "amazon-food-ordering": "money",
  "amazon-toll-fare-streaming": "pipelines",
  "swiggy-promo-notifications": "pipelines",
  "google-job-alerts": "pipelines",
  "netflix-ml-job-scheduler": "pipelines",
  "razorpay-job-scheduler": "pipelines",
  "phonepe-search-engine": "platforms",
  "atlassian-tagging-system": "platforms",
  "meta-coding-platform": "platforms",
  "apple-github-clone": "platforms",
  "microsoft-firmware-updates": "platforms",
};
