import Link from "next/link";
import { topicKit } from "@/components/topic/TopicKit";
import { Ring } from "./Ring";
import { TrailLeg } from "./TrailLeg";
import { toneStyle } from "./tone";
import type { ShellAction, ShellHero, ShellStanding, ShellTeaser } from "./types";
import styles from "./shell.module.css";

function PrimaryAction({ action, className }: { action: ShellAction; className?: string }) {
  return (
    <Link
      className={`${topicKit.btn}${className ? ` ${className}` : ""}`}
      id="topic-primary"
      href={action.href}
      prefetch={false}
      data-door={action.id}
      onClick={action.onClick}
    >
      {action.label} <span aria-hidden="true">→</span>
    </Link>
  );
}

function Teaser({ teaser }: { teaser: ShellTeaser }) {
  const last = teaser.stops.length - 1;
  return (
    <div className={styles.teaser} aria-hidden="true" data-teaser>
      <p className={styles.teaserCaption}>{teaser.caption}</p>
      <ol className={styles.teaserList}>
        {teaser.stops.map((stop, index) => (
          <li className={styles.teaserItem} key={stop.id} style={toneStyle(stop.tone)}>
            <span className={styles.teaserNode}>{index + 1}</span>
            {index < last && <TrailLeg walked={false} />}
            <span className={styles.teaserName}>{stop.name}</span>
            {stop.promise && <span className={styles.teaserPromise}>{stop.promise}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Standing({ standing, action }: { standing: ShellStanding; action: ShellAction | null }) {
  const { upNext } = standing;
  return (
    <div className={styles.standing}>
      <section className={styles.level} aria-label={standing.kicker} style={toneStyle(standing.tone)}>
        <Ring read={standing.read} total={standing.total} label="chapters read" />
        <div className={styles.levelText}>
          <p className={styles.kicker}>{standing.kicker}</p>
          {standing.name && <p className={styles.levelName}>{standing.name}</p>}
          <p className={styles.levelSum}>{standing.summary}</p>
          {standing.recheck && (
            <Link
              className={styles.softLink}
              href={standing.recheck.href}
              prefetch={false}
              data-link={standing.recheck.id}
            >
              {standing.recheck.label}
            </Link>
          )}
          {standing.prompt && (
            <p className={styles.prompt}>
              {standing.prompt.text}{" "}
              <Link
                className={styles.softLink}
                href={standing.prompt.link.href}
                prefetch={false}
                data-link={standing.prompt.link.id}
              >
                {standing.prompt.link.label}
              </Link>
            </p>
          )}
        </div>
      </section>
      <section className={styles.upNext} aria-label={upNext ? "Up next" : "All caught up"}>
        <p className={styles.kicker}>{upNext ? "Up next" : "All caught up"}</p>
        {upNext ? (
          <>
            <p className={styles.upTitle}>
              <span className={styles.upCode}>{upNext.code}</span> {upNext.title}
            </p>
            {upNext.meta && <p className={styles.upMeta}>{upNext.meta}</p>}
          </>
        ) : (
          <p className={styles.upMeta}>Every chapter in your plan is read. Review keeps it fresh.</p>
        )}
        {action && <PrimaryAction action={action} className={styles.upAction} />}
      </section>
    </div>
  );
}

export function Hero({ hero, pending }: { hero: ShellHero; pending: string }) {
  const mode = hero.standing ? "standing" : hero.teaser ? "invite" : "plain";
  const plainAction = !hero.standing && !hero.teaser && hero.action;

  return (
    <header className={`${styles.hero}${pending}`} data-hero data-mode={mode}>
      <div className={styles.heroText}>
        <div className={styles.heroHead}>
          <h1 className={styles.title} id="topic-title">
            {hero.eyebrow && (
              <>
                <span className={styles.eyebrow}>{hero.eyebrow}</span>
                <span className="visually-hidden">: </span>
              </>
            )}
            <span className={styles.titleText}>{hero.title}</span>
          </h1>
          {plainAction && (
            <div className={styles.heroAction}>
              <PrimaryAction action={plainAction} />
            </div>
          )}
        </div>
        {hero.status && <p className={styles.status}>{hero.status}</p>}
        {hero.lead && <p className={styles.lead}>{hero.lead}</p>}
        {hero.teaser && hero.action && (
          <div className={styles.invite}>
            <PrimaryAction action={hero.action} />
            {hero.note && <p className={styles.note}>{hero.note}</p>}
            {hero.links.length > 0 && (
              <p className={styles.links}>
                {hero.links.map((link) => (
                  <Link
                    key={link.id ?? link.href}
                    className={styles.softLink}
                    href={link.href}
                    prefetch={false}
                    data-door={link.id}
                    onClick={link.onClick}
                  >
                    {link.label}
                  </Link>
                ))}
              </p>
            )}
          </div>
        )}
        {hero.choice}
      </div>
      {hero.teaser && <Teaser teaser={hero.teaser} />}
      {hero.standing && <Standing standing={hero.standing} action={hero.action} />}
    </header>
  );
}
