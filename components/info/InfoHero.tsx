"use client";

import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import {
  Actions,
  Button,
  CardKicker,
  Chips,
  Heading,
  Kicker,
  Lead,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import styles from "./info.module.css";

export interface InfoEntry {
  id: string;
  title: string;
}

export interface InfoHeroProps {
  mark: string;
  kicker: string;
  title: string;
  lead: string;
  entries: InfoEntry[];
  updated: string;
  tag: string;
  short: string;
  contact: string;
  jump: { href: string; label: string };
}

export function InfoHero({ mark, kicker, title, lead, entries, updated, tag, short, contact, jump }: InfoHeroProps) {
  return (
    <Scene className={topicKit.hero}>
      <Copy>
        <Kicker mark={mark}>{kicker}</Kicker>
        <Heading>
          <Underlined>{title}</Underlined>
        </Heading>
        <Lead>{lead}</Lead>
        <Actions>
          <Button href={jump.href}>
            {jump.label} <span aria-hidden="true">→</span>
          </Button>
          <Button ghost href="/">
            Back to all topics
          </Button>
        </Actions>
        <Chips>
          <span className={topicKit.chip}>{updated}</span>
        </Chips>
      </Copy>
      <Compose live layout="rail">
        <Card as="nav" aria-label="On this page" at="a" tilt={-1} taped>
          <CardKicker>On this page</CardKicker>
          <ol className={styles.toc}>
            {entries.map((entry, i) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`}>
                  <span className={styles.num} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {entry.title}
                </a>
              </li>
            ))}
          </ol>
          <Remark>jump to any of them</Remark>
        </Card>
        <Card at="b" tone="note" tilt={1}>
          <Tag tone="success">{tag}</Tag>
          <CardKicker>In short</CardKicker>
          <p className={styles.short}>{short}</p>
        </Card>
        <Card at="c" tilt={-1}>
          <CardKicker>Write to us</CardKicker>
          <a className={styles.contact} href={`mailto:${contact}`}>
            {contact}
          </a>
        </Card>
      </Compose>
    </Scene>
  );
}
