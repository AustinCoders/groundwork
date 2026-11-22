import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { TopicPage } from "@/components/topic/TopicKit";
import { pageMetadata } from "@/lib/metadata";
import { AccountView } from "./AccountView";

export const metadata: Metadata = pageMetadata({
  title: "Your account",
  description: "Your Groundwork account: profile, sync across devices, your data, and deleting the account.",
  path: "/account",
  index: false,
});

export default function AccountPage() {
  return (
    <PageFrame title="Account" mark="◉" accent="blue" skipLabel="Skip to your account">
      <TopicPage accent="blue">
        <AccountView />
      </TopicPage>
    </PageFrame>
  );
}
