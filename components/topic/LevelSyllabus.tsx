import { Station, Journey, JourneyStop, Check, Checkpoint, SoonTag, StopHead } from "@/components/topic/Journey";
import { Band, topicKit } from "@/components/topic/TopicKit";
import { padNumber } from "@/components/topic/LevelPicker";
import { plural } from "@/lib/format";
import { levelRows } from "@/lib/levelRows";
import type { ChapterMeta, Level } from "@/content/types";

export function LevelSyllabus({
  no,
  basePath,
  levels,
  chapterById,
  savedLevel,
  chapterCount,
}: {
  no: string;
  basePath: string;
  levels: Level[];
  chapterById: Record<string, ChapterMeta>;
  savedLevel: string | null;
  chapterCount: number;
}) {
  return (
    <Band
      no={no}
      id="syllabus-title"
      label="Full syllabus"
      title="Every stop on the way"
      sub="Everything each level eventually covers. Flags with a tick are written, the dashed ones are still on the desk."
      count={plural(chapterCount, "chapter")}
    >
      <div id="syllabus">
        {levels.map((level, index) => {
          const rows = levelRows(level, chapterById);
          const written = rows.filter((r) => r.ready).length;
          return (
            <div key={level.id} className={topicKit.level}>
              <Station
                no={padNumber(index + 1)}
                name={level.name}
                id={`station-${level.id}`}
                quote={level.tagline}
                mark={savedLevel === level.id ? "Your level" : undefined}
                chips={[`${written} / ${rows.length} sections written`]}
              />
              <Journey count={rows.length} slot={76} label={`${level.name}: every section`}>
                {rows.map((row, i) => (
                  <JourneyStop
                    key={row.ready ? row.chapter.id : row.section.title + i}
                    state={row.ready ? "done" : "soon"}
                  >
                    {row.ready ? (
                      <StopHead
                        code={row.chapter.num}
                        title={row.chapter.title}
                        rawTitle
                        sub={row.chapter.subtitle}
                        rawSub
                        href={`${basePath}/${row.chapter.id}`}
                        end={<Check />}
                      />
                    ) : (
                      <StopHead
                        code={row.chapter?.num}
                        title={row.section.title}
                        sub={row.section.items.join(" · ")}
                        href={row.chapter ? `${basePath}/${row.chapter.id}` : null}
                        end={<SoonTag />}
                      />
                    )}
                  </JourneyStop>
                ))}
              </Journey>
              {level.checkpoint && <Checkpoint>{level.checkpoint}</Checkpoint>}
            </div>
          );
        })}
      </div>
    </Band>
  );
}
