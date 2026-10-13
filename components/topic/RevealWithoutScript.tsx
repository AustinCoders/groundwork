export function RevealWithoutScript({ className }: { className: string }) {
  return (
    <noscript>
      <style>{`.${className}{visibility:visible !important}`}</style>
    </noscript>
  );
}
