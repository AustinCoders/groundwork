import { PageFrame, type FrameLayout, type FrameLink, type FrameScan } from "@/components/frame/PageFrame";

export interface FrameTopic {
  name: string;
  href: string;
  mark: string;
  accent: string;
}

export function TopicFrame({
  topic,
  back,
  actions,
  reading,
  layout,
  skip,
  scan,
  children,
}: {
  topic: FrameTopic;
  back?: FrameLink;
  actions?: React.ReactNode;
  reading?: boolean;
  layout?: FrameLayout;
  skip?: { label: string; href?: string };
  scan?: FrameScan;
  children: React.ReactNode;
}) {
  return (
    <PageFrame
      title={topic.name}
      titleHref={topic.href}
      mark={topic.mark}
      accent={topic.accent}
      back={back}
      actions={actions}
      reading={reading}
      layout={layout}
      skipLabel={skip?.label ?? `Skip to ${topic.name}`}
      skipHref={skip?.href}
      scan={scan}
    >
      {children}
    </PageFrame>
  );
}
