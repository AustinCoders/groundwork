import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { LostScene, MenuKey } from "@/components/frame/LostScene";
import { LostActions } from "@/components/frame/LostActions";
import { Underlined } from "@/components/topic/TopicKit";
import { guidesNav } from "@/lib/guidesNav";
import type { LostTopic } from "@/lib/lostTopic";
import { notesHref, topicHome, topics } from "@/lib/topics";
import styles from "@/components/frame/lost.module.css";

export const metadata: Metadata = { title: "Page not found" };

function lostTopics(): LostTopic[] {
  const guideIds = new Set(guidesNav().map((guide) => guide.id));
  return topics()
    .filter((topic) => topic.status === "ready")
    .map((topic) => ({
      id: topic.id,
      name: topic.name,
      segment: notesHref(topic.id).slice(1),
      home: topicHome(topic.id),
      guide: guideIds.has(topic.id),
    }));
}

export default function NotFound() {
  return (
    <PageFrame title="Page not found" skipLabel="Skip to the content" layout="reader">
      <LostScene
        accent="red"
        mark="?"
        kicker="this page isn't here"
        heading={
          <>
            Nothing written on <Underlined>this page</Underlined>
          </>
        }
        lead="The link might be old, or the chapter may have moved. Everything that exists is on the shelf. Start there and pick a topic."
        actions={<LostActions topics={lostTopics()} />}
        stamp="404"
        stampNote="page not found"
        stampTone="draft"
        sideKicker="Search instead"
        remark="Menu pill, top left"
        moreKicker="Or jump straight to"
        more={
          <ul className={styles.links}>
            <li>
              <Link href="/interview">The interview book</Link>
            </li>
            <li>
              <Link href="/mock">A mock interview</Link>
            </li>
            <li>
              <Link href="/problems">Practice problems</Link>
            </li>
          </ul>
        }
      >
        <p>
          Open the Menu and type what you were after, or press <MenuKey /> from any page.
        </p>
      </LostScene>
    </PageFrame>
  );
}
