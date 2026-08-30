import Link from "next/link";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" id="crumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <Fragment key={i}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="crumbs__sep">›</span>}
        </Fragment>
      ))}
    </nav>
  );
}
