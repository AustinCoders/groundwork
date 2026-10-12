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
import styles from "./privacy.module.css";

export interface PrivacyEntry {
  id: string;
  title: string;
}

export function PrivacyHero({
  entries,
  updated,
  contact,
}: {
  entries: PrivacyEntry[];
  updated: string;
  contact: string;
}) {
  return (
    <Scene className={topicKit.hero}>
      <Copy>
        <Kicker mark="§">What leaves this browser</Kicker>
        <Heading>
          <Underlined>Privacy</Underlined>
        </Heading>
        <Lead>
          There is no account and no database behind this site. Most of what you do stays in this browser. This page
          lists everything that does not, and the service that receives it.
        </Lead>
        <Actions>
          <Button href="#leaves">
            What leaves it <span aria-hidden="true">→</span>
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
          <Tag tone="success">✓ no account</Tag>
          <CardKicker>In short</CardKicker>
          <p className={styles.short}>There is nothing to sign up for, and the site sets no cookies of its own.</p>
        </Card>
        <Card at="c" tilt={-1}>
          <CardKicker>Questions</CardKicker>
          <a className={styles.contact} href={`mailto:${contact}`}>
            {contact}
          </a>
        </Card>
      </Compose>
    </Scene>
  );
}
