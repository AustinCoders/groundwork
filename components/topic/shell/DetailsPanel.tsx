import { Fold } from "./Fold";
import type { ShellDetails } from "./types";

export function DetailsPanel({ details }: { details: ShellDetails }) {
  return (
    <Fold id={details.id} summaryId={`${details.id}-summary`} variant="panel" name={details.title} hint={details.hint}>
      {details.children}
    </Fold>
  );
}
