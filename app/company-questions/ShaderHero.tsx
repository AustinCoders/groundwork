"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./motion.module.css";

const ShaderCanvas = dynamic(() => import("./ShaderCanvas"), { ssr: false });

type SaverNavigator = Navigator & { connection?: { saveData?: boolean } };

export function ShaderHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [live, setLive] = useState(false);
  const goLive = useCallback(() => setLive(true), []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if ((navigator as SaverNavigator).connection?.saveData) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setLoaded(true);
      },
      { rootMargin: "120px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.shader} data-live={live ? "" : undefined} aria-hidden="true">
      <div className={styles.aurora} />
      {loaded && <ShaderCanvas active={active} onLive={goLive} />}
    </div>
  );
}
