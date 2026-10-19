import type { Company } from "./types";

export const COMPANIES: readonly Company[] = [
  { id: "google", name: "Google", group: "global" },
  { id: "meta", name: "Meta", group: "global" },
  { id: "amazon", name: "Amazon", group: "global" },
  { id: "microsoft", name: "Microsoft", group: "global" },
  { id: "apple", name: "Apple", group: "global" },
  { id: "netflix", name: "Netflix", group: "global" },
  { id: "uber", name: "Uber", group: "global" },
  { id: "atlassian", name: "Atlassian", group: "global" },
  { id: "flipkart", name: "Flipkart", group: "india" },
  { id: "swiggy", name: "Swiggy", group: "india" },
  { id: "razorpay", name: "Razorpay", group: "india" },
  { id: "phonepe", name: "PhonePe", group: "india" },
];

export const EVIDENCE_LABEL = {
  several: "Reported in several places",
  one: "Reported once",
  guide: "Listed in prep guides",
} as const;
