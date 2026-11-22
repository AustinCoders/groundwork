"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import styles from "./profile.module.css";

const FRAME = 280;
const OUTPUT = 256;
const MAX_ZOOM = 4;

interface View {
  zoom: number;
  x: number;
  y: number;
}

function clampView(view: View, width: number, height: number): View {
  const base = Math.max(FRAME / width, FRAME / height);
  const zoom = Math.min(MAX_ZOOM, Math.max(1, view.zoom));
  const w = width * base * zoom;
  const h = height * base * zoom;
  return {
    zoom,
    x: Math.min(0, Math.max(FRAME - w, view.x)),
    y: Math.min(0, Math.max(FRAME - h, view.y)),
  };
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function cropToBlob(image: ImageBitmap, view: View): Promise<Blob | null> {
  const base = Math.max(FRAME / image.width, FRAME / image.height);
  const scale = base * view.zoom;
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT;
  canvas.height = OUTPUT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, -view.x / scale, -view.y / scale, FRAME / scale, FRAME / scale, 0, 0, OUTPUT, OUTPUT);
  const webp = await canvasBlob(canvas, "image/webp", 0.86);
  if (webp && webp.type === "image/webp") return webp;
  return canvasBlob(canvas, "image/jpeg", 0.88);
}

export function PhotoCropper({
  file,
  onCancel,
  onDone,
}: {
  file: File;
  onCancel: () => void;
  onDone: (image: Blob) => Promise<string | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; view: View } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    let live = true;
    const objectUrl = URL.createObjectURL(file);
    createImageBitmap(file, { imageOrientation: "from-image" })
      .then((image) => {
        if (!live) return;
        setBitmap(image);
        setUrl(objectUrl);
        const base = Math.max(FRAME / image.width, FRAME / image.height);
        setView(
          clampView(
            { zoom: 1, x: (FRAME - image.width * base) / 2, y: (FRAME - image.height * base) / 2 },
            image.width,
            image.height
          )
        );
      })
      .catch(() => {
        if (live) setError("That file could not be read as a picture. Try a JPG, PNG or WebP.");
      });
    return () => {
      live = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function zoomTo(next: number) {
    if (!bitmap) return;
    setView((now) => {
      const centre = FRAME / 2;
      const ratio = Math.min(MAX_ZOOM, Math.max(1, next)) / now.zoom;
      return clampView(
        { zoom: next, x: centre - (centre - now.x) * ratio, y: centre - (centre - now.y) * ratio },
        bitmap.width,
        bitmap.height
      );
    });
  }

  function onDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, view };
  }

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || !bitmap) return;
    setView(
      clampView(
        { zoom: start.view.zoom, x: start.view.x + event.clientX - start.x, y: start.view.y + event.clientY - start.y },
        bitmap.width,
        bitmap.height
      )
    );
  }

  async function save() {
    if (!bitmap) return;
    setBusy(true);
    setError(null);
    const blob = await cropToBlob(bitmap, view);
    if (!blob) {
      setBusy(false);
      setError("Could not prepare the picture. Try another one.");
      return;
    }
    const problem = await onDone(blob);
    setBusy(false);
    if (problem) setError(problem);
  }

  const base = bitmap ? Math.max(FRAME / bitmap.width, FRAME / bitmap.height) : 1;

  return (
    <dialog
      ref={ref}
      className={styles.cropDialog}
      aria-labelledby={titleId}
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
    >
      <h2 id={titleId} className={styles.cardTitle}>
        Position your photo
      </h2>
      <p className={styles.hint}>Drag to move it, and use the slider or your scroll wheel to zoom.</p>
      <div
        className={styles.cropFrame}
        style={
          url && bitmap
            ? {
                backgroundImage: `url("${url}")`,
                backgroundSize: `${bitmap.width * base * view.zoom}px ${bitmap.height * base * view.zoom}px`,
                backgroundPosition: `${view.x}px ${view.y}px`,
              }
            : undefined
        }
        role="img"
        aria-label="Your photo, as it will be cropped"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onWheel={(event) => zoomTo(view.zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08))}
      >
        {!bitmap && !error && <span className={styles.cropLoading}>Opening the picture…</span>}
        <span className={styles.cropRing} aria-hidden="true" />
      </div>
      <label className={styles.zoom}>
        <span aria-hidden="true">−</span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={view.zoom}
          aria-label="Zoom"
          disabled={!bitmap}
          onChange={(e) => zoomTo(Number(e.target.value))}
        />
        <span aria-hidden="true">+</span>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.barActions}>
        <button type="button" className={styles.ghost} onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className={styles.primary} onClick={() => void save()} disabled={!bitmap || busy}>
          {busy ? "Uploading…" : "Use this photo"}
        </button>
      </div>
    </dialog>
  );
}
