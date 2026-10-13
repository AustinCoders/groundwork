import { Suspense } from "react";
import { PathRedirect } from "./PathRedirect";
import { pathTargets } from "./pathTargets";

export default function PathPage() {
  return (
    <Suspense fallback={null}>
      <PathRedirect targets={pathTargets()} />
    </Suspense>
  );
}
