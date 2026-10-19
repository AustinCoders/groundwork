"use client";

import { useEffect, useRef, type ReactNode, type SVGProps } from "react";

export function SvgFit({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const fit = () => {
      svg.querySelectorAll<SVGTextContentElement>("[data-max]").forEach((text) => {
        text.removeAttribute("textLength");
        text.removeAttribute("lengthAdjust");
        const max = Number(text.getAttribute("data-max"));
        if (max > 0 && text.getComputedTextLength() > max) {
          text.setAttribute("textLength", String(max));
          text.setAttribute("lengthAdjust", "spacingAndGlyphs");
        }
      });
    };
    fit();
    void document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(() => fit());
    observer.observe(svg);
    window.addEventListener("resize", fit);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, []);

  return (
    <svg ref={ref} {...props}>
      {children}
    </svg>
  );
}
