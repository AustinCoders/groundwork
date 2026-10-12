import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { LostScene, MenuKey } from "@/components/frame/LostScene";
import { Button, Underlined } from "@/components/topic/TopicKit";
import styles from "@/components/frame/lost.module.css";

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
        actions={
          <>
            <Button href="/">
              Back to all topics <span aria-hidden="true">→</span>
            </Button>
            <Button ghost href="/dsa">
              Open the DSA notes
            </Button>
          </>
        }
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
