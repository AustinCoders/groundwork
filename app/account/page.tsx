import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
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
    <PageFrame title="Account" mark="◉" accent="blue" layout="reader" skipLabel="Skip to your account">
      <AccountView />
    </PageFrame>
  );
}
