import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/MenuKit";
import { Wrap, topicKit } from "@/components/topic/TopicKit";
import styles from "./privacy.module.css";

export function PrivacySection({
  no,
  id,
  label,
  title,
  children,
}: {
  no: string;
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={topicKit.band} aria-labelledby={id}>
      <Wrap>
        <div className={styles.grid}>
          <div className={styles.head}>
            <Eyebrow no={no} as="p">
              {label}
            </Eyebrow>
            <h2 className={topicKit.h2} id={id}>
              {title}
            </h2>
          </div>
          <div className={styles.panel}>
            <div className="prose">{children}</div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
