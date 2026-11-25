"use client";

import Link from "next/link";
import type { CompanyChoice } from "@/lib/profile/companies";
import { usePlan } from "@/lib/profile/plan";
import { HUB_PATH } from "./shared";
import styles from "./yourCompanies.module.css";

export function YourCompanies({ companies: all }: { companies: CompanyChoice[] }) {
  const { companies } = usePlan();
  const chosen = companies.map((id) => all.find((c) => c.id === id)).filter((c): c is CompanyChoice => Boolean(c));
  if (chosen.length === 0) return null;
  return (
    <nav id="your-companies" className={styles.strip} aria-label="Your target companies">
      <p className={styles.label}>
        <b>Your companies</b>
        <Link href="/account#account-plan" className={styles.change} prefetch={false}>
          Change
        </Link>
      </p>
      <ul className={styles.list}>
        {chosen.map((company) => (
          <li key={company.id}>
            <Link href={`${HUB_PATH}/${company.id}`} className={styles.chip}>
              {company.name}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
