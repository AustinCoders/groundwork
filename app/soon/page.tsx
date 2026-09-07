import type { Metadata } from "next";
import SoonClient from "./SoonClient";

export const metadata: Metadata = { title: "Coming soon" };

export default function SoonPage() {
  return <SoonClient />;
}
