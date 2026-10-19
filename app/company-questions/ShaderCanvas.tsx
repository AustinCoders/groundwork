"use client";

import { useEffect, useRef } from "react";
import styles from "./motion.module.css";

const VERTEX = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";

const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec2 uPtr;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 2.1 + uPtr * 0.3;
  float t = uTime * 0.07;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 2.4 * q + vec2(t * 1.4, -t));
  float band = smoothstep(0.38, 0.9, f);
  float ridge = smoothstep(0.0, 0.06, abs(f - 0.62)) ;
  vec3 col = mix(uA, uB, clamp(q.x * 1.3, 0.0, 1.0));
  float fade = mix(0.25, 1.0, smoothstep(0.1, 0.95, uv.x)) * mix(0.55, 1.0, uv.y);
  float a = (band * 0.5 + (1.0 - ridge) * 0.18) * fade;
  gl_FragColor = vec4(col * a, a);
}
`;

let scratch: CanvasRenderingContext2D | null = null;

function resolveColor(host: HTMLElement, expression: string): [number, number, number] {
  const probe = document.createElement("i");
  probe.style.color = expression;
  host.appendChild(probe);
  const css = getComputedStyle(probe).color;
  probe.remove();
  scratch ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!scratch) return [0.5, 0.5, 0.8];
  scratch.clearRect(0, 0, 1, 1);
  scratch.fillStyle = css;
  scratch.fillRect(0, 0, 1, 1);
  const { data } = scratch.getImageData(0, 0, 1, 1);
  return [data[0] / 255, data[1] / 255, data[2] / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ShaderCanvas({ active, onLive }: { active: boolean; onLive: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uniform("uRes");
    const uTime = uniform("uTime");
    const uA = uniform("uA");
    const uB = uniform("uB");
    const uPtr = uniform("uPtr");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let frame = 0;
    let last = 0;
    let lit = false;

    const paintColors = () => {
      const [ar, ag, ab] = resolveColor(canvas, "var(--accent, var(--primary))");
      const [br, bg, bb] = resolveColor(canvas, "var(--primary)");
      gl.uniform3f(uA, ar, ag, ab);
      gl.uniform3f(uB, br, bg, bb);
    };

    const draw = (seconds: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      gl.uniform1f(uTime, seconds);
      gl.uniform2f(uPtr, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!lit) {
        lit = true;
        onLive();
      }
    };

    const resize = () => {
      const width = Math.max(2, Math.round(canvas.clientWidth * 0.5));
      const height = Math.max(2, Math.round(canvas.clientHeight * 0.5));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
      if (still) draw(4);
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      if (!activeRef.current || document.hidden || now - last < 33) return;
      last = now;
      draw(now / 1000);
    };

    const move = (event: PointerEvent) => {
      if (!activeRef.current) return;
      const box = canvas.getBoundingClientRect();
      pointer.tx = Math.min(1, Math.max(-1, ((event.clientX - box.left) / box.width) * 2 - 1));
      pointer.ty = Math.min(1, Math.max(-1, ((event.clientY - box.top) / box.height) * 2 - 1));
    };

    paintColors();
    resize();
    const resizer = new ResizeObserver(resize);
    resizer.observe(canvas);
    const themes = new MutationObserver(() => {
      paintColors();
      if (still) draw(4);
    });
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    if (!still) {
      window.addEventListener("pointermove", move, { passive: true });
      frame = window.requestAnimationFrame(loop);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      resizer.disconnect();
      themes.disconnect();
      if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [onLive]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
