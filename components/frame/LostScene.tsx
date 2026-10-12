"use client";

import type { ReactNode } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { useShortcutLabel } from "@/components/menu/Shortcuts";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { Actions, CardKicker, Heading, Kicker, Lead, TopicPage, topicKit } from "@/components/topic/TopicKit";
import { useMounted } from "@/lib/hooks";
import styles from "./lost.module.css";

export function MenuKey() {
  const label = useShortcutLabel();
  const mounted = useMounted();
  return <kbd className={mounted ? styles.key : `${styles.key} ${topicKit.pending}`}>{label}</kbd>;
}

export function LostScene({
  accent,
  mark,
  kicker,
  heading,
  lead,
  actions,
  stamp,
  stampNote,
  stampTone,
  sticker,
  sideKicker,
  remark,
  moreKicker,
  more,
  children,
}: {
  accent: string;
  mark: string;
  kicker: string;
  heading: ReactNode;
  lead: string;
  actions: ReactNode;
  stamp: string;
  stampNote: string;
  stampTone: "draft" | "alert";
  sticker?: string;
  sideKicker: string;
  remark: string;
  moreKicker: string;
  more: ReactNode;
  children: ReactNode;
}) {
  return (
    <TopicPage accent={accent}>
      <Scene className={topicKit.hero}>
        <Copy>
          <Kicker mark={mark} dashed>
            {kicker}
          </Kicker>
          <Heading>{heading}</Heading>
          <Lead>{lead}</Lead>
          <Actions>{actions}</Actions>
        </Copy>
        <Compose live layout="rail">
          <Card at="a" tone={stampTone} tilt={-1} taped className={styles.stampCard}>
            <p className={styles.stamp} aria-hidden="true">
              {stamp}
            </p>
            <p className={styles.stampNote}>{stampNote}</p>
            <div className={styles.blank} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </Card>
          <Card at="b" tilt={1}>
            <CardKicker>{moreKicker}</CardKicker>
            <div className={styles.body}>{more}</div>
          </Card>
          <Card at="c" tone="note" tilt={-1}>
            {sticker && <Tag tone="info">{sticker}</Tag>}
            <CardKicker>{sideKicker}</CardKicker>
            <div className={styles.body}>{children}</div>
            <Remark>{remark}</Remark>
          </Card>
        </Compose>
      </Scene>
    </TopicPage>
  );
}
