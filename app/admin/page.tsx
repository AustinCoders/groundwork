import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { AdminView } from "./AdminView";

export const metadata: Metadata = pageMetadata({
  title: "Admin",
  description: "Reports and account safety for Groundwork admins.",
  path: "/admin",
  index: false,
});

export default function AdminPage() {
  return (
    <PageFrame title="Admin" mark="⚑" accent="blue" layout="reader" skipLabel="Skip to admin">
      <AdminView />
    </PageFrame>
  );
}
