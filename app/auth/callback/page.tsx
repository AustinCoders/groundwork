import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { CallbackView } from "./CallbackView";

export const metadata: Metadata = pageMetadata({
  title: "Signing you in",
  description: "Finishing sign-in to Groundwork.",
  path: "/auth/callback",
  index: false,
});

export default function AuthCallbackPage() {
  return (
    <PageFrame title="Sign in" mark="◉" accent="blue" skipLabel="Skip to sign-in status">
      <CallbackView />
    </PageFrame>
  );
}
