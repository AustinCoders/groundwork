export function RichHtml({
  html,
  label,
  className,
  id,
}: {
  html: string;
  label: string;
  className?: string;
  id?: string;
}) {
  const holdsCode = /<pre[\s>]/.test(html);
  return (
    <div
      id={id}
      className={className}
      {...(holdsCode ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
