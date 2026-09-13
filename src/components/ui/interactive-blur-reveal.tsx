// Built using Hyperiux Vault: https://vault.hyperiux.com



"use client";



import {

  useEffect,

  useRef,

  useState,

  type CSSProperties,

  type PointerEvent as ReactPointerEvent,

} from "react";



/* ------------------------------------------------------------------ *

 * Inlined from ./webgl-context-recovery

 *

 * A raw WebGL2 context gets no automatic recovery. On `webglcontextlost`

 * the handler must call preventDefault() or the browser never fires

 * `webglcontextrestored`, leaving the canvas blank until a full reload.

 * ------------------------------------------------------------------ */

interface WebGLContextRecoveryHandlers {

  onLost?: (event: Event) => void;

  onRestored?: (event: Event) => void;

}



function attachWebGLContextRecovery(

  canvas: HTMLCanvasElement | null | undefined,

  handlers: WebGLContextRecoveryHandlers = {},

) {

  if (!canvas) return () => {};



  const { onLost, onRestored } = handlers;



  const handleLost = (event: Event) => {

    event.preventDefault();

    if (onLost) onLost(event);

  };



  const handleRestored = (event: Event) => {

    if (onRestored) onRestored(event);

  };



  canvas.addEventListener("webglcontextlost", handleLost, false);

  canvas.addEventListener("webglcontextrestored", handleRestored, false);



  return () => {

    canvas.removeEventListener("webglcontextlost", handleLost, false);

    canvas.removeEventListener("webglcontextrestored", handleRestored, false);

  };

}



/* ------------------------------------------------------------------ *

 * Inlined from ./createSuspendedRaf

 *

 * Owns a requestAnimationFrame loop that auto-pauses when the tab is

 * hidden or the root element is scrolled offscreen.

 * ------------------------------------------------------------------ */

const DEFAULT_ROOT_MARGIN = "256px";



type RafRoot =

  | Element

  | null

  | { current: Element | null }

  | (() => Element | null);



function resolveElement(root: RafRoot): Element | null {

  if (!root) return null;

  if (typeof root === "function") return root() ?? null;

  if (typeof root === "object" && "current" in root) return root.current ?? null;

  return root;

}



interface VisibilityGateOptions {

  root?: RafRoot;

  rootMargin?: string;

  threshold?: number;

  observeTab?: boolean;

  observeOffscreen?: boolean;

  onChange?: (active: boolean) => void;

}



interface VisibilityGate {

  readonly isActive: boolean;

  observe: (nextRoot?: RafRoot) => void;

  destroy: () => void;

}



function createVisibilityGate({

  root = null,

  rootMargin = DEFAULT_ROOT_MARGIN,

  threshold = 0,

  observeTab = true,

  observeOffscreen = true,

  onChange,

}: VisibilityGateOptions = {}): VisibilityGate {

  let tabVisible = typeof document === "undefined" ? true : !document.hidden;

  let onscreen = true;

  let destroyed = false;

  let observer: IntersectionObserver | null = null;



  const isActive = () => {

    if (destroyed) return false;

    if (observeTab && !tabVisible) return false;

    if (observeOffscreen && resolveElement(root) && !onscreen) return false;

    return true;

  };



  let lastActive = isActive();



  const emit = () => {

    if (destroyed) return;

    const next = isActive();

    if (next === lastActive) return;

    lastActive = next;

    onChange?.(next);

  };



  const onVisibilityChange = () => {

    tabVisible = !document.hidden;

    emit();

  };



  if (observeTab && typeof document !== "undefined") {

    document.addEventListener("visibilitychange", onVisibilityChange);

  }



  const bindObserver = () => {

    if (!observeOffscreen || typeof IntersectionObserver === "undefined") {

      return;

    }



    const el = resolveElement(root);

    if (!el) return;



    observer = new IntersectionObserver(

      (entries) => {

        for (const entry of entries) {

          onscreen = entry.isIntersecting;

        }

        emit();

      },

      { rootMargin, threshold },

    );



    observer.observe(el);

  };



  bindObserver();



  return {

    get isActive() {

      return isActive();

    },



    observe(nextRoot?: RafRoot) {

      if (destroyed) return;

      if (nextRoot != null) root = nextRoot;

      if (observer) {

        observer.disconnect();

        observer = null;

      }

      onscreen = true;

      bindObserver();

      emit();

    },



    destroy() {

      if (destroyed) return;

      destroyed = true;

      if (observeTab && typeof document !== "undefined") {

        document.removeEventListener("visibilitychange", onVisibilityChange);

      }

      if (observer) {

        observer.disconnect();

        observer = null;

      }

    },

  };

}



interface SuspendedRafOptions {

  onFrame: (time: number) => void;

  root?: RafRoot;

  rootMargin?: string;

  threshold?: number;

  observeTab?: boolean;

  observeOffscreen?: boolean;

}



interface SuspendedRaf {

  start: () => void;

  stop: () => void;

  readonly isRunning: boolean;

  readonly isActive: boolean;

  observe: (nextRoot?: RafRoot) => void;

  destroy: () => void;

}



function createSuspendedRaf({

  onFrame,

  root = null,

  rootMargin = DEFAULT_ROOT_MARGIN,

  threshold = 0,

  observeTab = true,

  observeOffscreen = true,

}: SuspendedRafOptions): SuspendedRaf {

  if (typeof onFrame !== "function") {

    throw new TypeError("createSuspendedRaf: onFrame is required");

  }



  let rafId: number | null = null;

  let running = false;

  let destroyed = false;



  const stopRaf = () => {

    if (rafId != null) {

      cancelAnimationFrame(rafId);

      rafId = null;

    }

  };



  const tick = (time: number) => {

    rafId = null;

    if (destroyed || !running || !gate.isActive) return;

    onFrame(time);

    if (!destroyed && running && gate.isActive) {

      rafId = requestAnimationFrame(tick);

    }

  };



  const sync = () => {

    if (destroyed) return;

    if (running && gate.isActive) {

      if (rafId == null) {

        rafId = requestAnimationFrame(tick);

      }

    } else {

      stopRaf();

    }

  };



  const gate = createVisibilityGate({

    root,

    rootMargin,

    threshold,

    observeTab,

    observeOffscreen,

    onChange: sync,

  });



  return {

    start() {

      if (destroyed) return;

      running = true;

      sync();

    },



    stop() {

      running = false;

      stopRaf();

    },



    get isRunning() {

      return running;

    },



    get isActive() {

      return gate.isActive;

    },



    observe(nextRoot?: RafRoot) {

      gate.observe(nextRoot);

      sync();

    },



    destroy() {

      if (destroyed) return;

      destroyed = true;

      running = false;

      stopRaf();

      gate.destroy();

    },

  };

}



/* ------------------------------------------------------------------ *

 * Component

 * ------------------------------------------------------------------ */



function usePrefersReducedMotion() {

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);



  useEffect(() => {

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();

    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);

  }, []);



  return prefersReducedMotion;

}



const FULLSCREEN_TRIANGLE_VERTICES = new Float32Array([

  -1, -1,

  1, -1,

  -1, 1,

  -1, 1,

  1, -1,

  1, 1,

]);



const TEXTURE_UNIT_BASE = 0;

const TEXTURE_UNIT_NOISE = 1;

const TEXTURE_UNIT_MASK = 2;



const DEFAULT_POINTER_POSITION = 0.5;

const DEFAULT_FRAME_TIME_MS = 16.67;

const MAX_FRAME_DELTA_MS = 64;



const POINTER_LERP_FACTOR = 0.001;

const STOP_VELOCITY_EPSILON = 0.00008;



const MASK_FADE_ALPHA = 0.015;

const MASK_IDLE_FADE_ALPHA = 0.085;



const DEFAULT_MOUSE_RADIUS = 180;

const DEFAULT_DURATION = 0.3;



// Noise texture — r2 CDN sends `access-control-allow-origin: *`, so it loads

// cleanly into a WebGL texture with `crossOrigin="anonymous"`.

const DEFAULT_NOISE_TEXTURE =

  "data:image/png;base64,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";



// Base image — inlined as a data URI so the effect is self-contained and never

// tainted by a cross-origin texture upload. Pass your own `iChannel0` (URL or

// data URI) to swap it; a remote URL must send permissive CORS headers.

const DEFAULT_BASE_TEXTURE = "data:image/jpeg;base64,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";



const BLUR_REVEAL_VERT = /* glsl */ `#version 300 es

in vec2 position;



void main() {

  gl_Position = vec4(position, 0.0, 1.0);

}

`;



const BLUR_REVEAL_FRAG = /* glsl */ `#version 300 es

precision highp float;



uniform vec2      iResolution;

uniform float     iTime;

uniform sampler2D iChannel0;

uniform sampler2D iChannel1;

uniform sampler2D iMask;



out vec4 fragColor;



vec2 distortUv(vec2 uv) {

  vec2 noiseUv = uv * 2.2;

  vec2 noiseOffset = texture(iChannel1, noiseUv).xy - 0.5;



  return uv + noiseOffset * 0.012;

}



vec4 blur21(sampler2D tex, vec2 uv, float radiusPx) {

  vec2 px = radiusPx / iResolution;

  vec4 color = vec4(0.0);



  color += texture(tex, uv) * 0.12;



  color += texture(tex, uv + px * vec2(1.0, 0.0)) * 0.08;

  color += texture(tex, uv + px * vec2(-1.0, 0.0)) * 0.08;

  color += texture(tex, uv + px * vec2(0.0, 1.0)) * 0.08;

  color += texture(tex, uv + px * vec2(0.0, -1.0)) * 0.08;



  color += texture(tex, uv + px * vec2(1.0, 1.0)) * 0.065;

  color += texture(tex, uv + px * vec2(-1.0, 1.0)) * 0.065;

  color += texture(tex, uv + px * vec2(1.0, -1.0)) * 0.065;

  color += texture(tex, uv + px * vec2(-1.0, -1.0)) * 0.065;



  color += texture(tex, uv + px * vec2(2.0, 0.0)) * 0.045;

  color += texture(tex, uv + px * vec2(-2.0, 0.0)) * 0.045;

  color += texture(tex, uv + px * vec2(0.0, 2.0)) * 0.045;

  color += texture(tex, uv + px * vec2(0.0, -2.0)) * 0.045;



  color += texture(tex, uv + px * vec2(3.0, 1.0)) * 0.025;

  color += texture(tex, uv + px * vec2(-3.0, 1.0)) * 0.025;

  color += texture(tex, uv + px * vec2(3.0, -1.0)) * 0.025;

  color += texture(tex, uv + px * vec2(-3.0, -1.0)) * 0.025;



  return color;

}



vec3 filmGrain(vec2 uv) {

  vec2 coarseUv = uv * (iResolution.xy / 260.0) + vec2(iTime * 0.035, -iTime * 0.028);

  vec2 fineUv = uv * (iResolution.xy / 120.0) + vec2(-iTime * 0.055, iTime * 0.041);



  vec3 coarse = texture(iChannel1, coarseUv).rgb - 0.5;

  float fine = texture(iChannel1, fineUv).r - 0.5;

  vec3 chroma = vec3(coarse.r, coarse.g * 0.9, coarse.b * 1.1);



  return chroma * 0.95 + fine * 0.65;

}



void main() {

  vec2 screenUv = gl_FragCoord.xy / iResolution.xy;

  screenUv.y = 1.0 - screenUv.y;



  vec2 imageUv = screenUv;



  vec4 frostedImage = blur21(iChannel0, distortUv(imageUv), 42.0);

  vec4 clearImage = texture(iChannel0, imageUv);



  float mask = texture(iMask, screenUv).a;



  float cloudNoise = texture(iChannel1, screenUv * 7.0).r;

  float fineNoise = texture(iChannel1, screenUv * 22.0).r;



  float revealMask = smoothstep(

    0.04,

    0.95,

    mask + cloudNoise * 0.08 + fineNoise * 0.035

  );



  frostedImage.rgb = mix(frostedImage.rgb, vec3(0.70, 0.76, 0.78), 0.18);

  frostedImage.rgb *= 0.96;



  vec4 mixed = mix(frostedImage, clearImage, revealMask);



  float grainAmount = mix(0.24, 0.12, revealMask);

  mixed.rgb += filmGrain(screenUv) * grainAmount;



  vec2 vignetteDelta = screenUv - 0.5;

  float vignette = smoothstep(0.85, 0.25, dot(vignetteDelta, vignetteDelta) * 1.35);

  mixed.rgb *= mix(0.96, 1.0, vignette);



  fragColor = vec4(clamp(mixed.rgb, 0.0, 1.0), 1.0);

}

`;



function createShader(gl: WebGL2RenderingContext, type: number, source: string) {

  const shader = gl.createShader(type) as WebGLShader;



  gl.shaderSource(shader, source);

  gl.compileShader(shader);



  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

    const errorMessage =

      gl.getShaderInfoLog(shader) || "Shader compilation failed.";



    gl.deleteShader(shader);

    throw new Error(errorMessage);

  }



  return shader;

}



function createProgram(

  gl: WebGL2RenderingContext,

  vertexSource: string,

  fragmentSource: string,

) {

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram() as WebGLProgram;



  gl.attachShader(program, vertexShader);

  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);



  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    const errorMessage =

      gl.getProgramInfoLog(program) || "Program linking failed.";



    gl.deleteShader(vertexShader);

    gl.deleteShader(fragmentShader);

    gl.deleteProgram(program);

    throw new Error(errorMessage);

  }



  gl.deleteShader(vertexShader);

  gl.deleteShader(fragmentShader);



  return program;

}



function resolveImageSource(source: any) {

  if (typeof source === "string") return source;

  if (source?.src) return source.src;



  return source;

}



function shouldUseCrossOrigin(source: any) {

  if (typeof source !== "string") return false;

  if (source.startsWith("data:") || source.startsWith("blob:")) return false;



  return true;

}



function loadImage(source: any): Promise<HTMLImageElement> {

  return new Promise((resolve, reject) => {

    if (source instanceof HTMLImageElement) {

      if (source.complete) {

        resolve(source);

      } else {

        source.onload = () => resolve(source);

        source.onerror = reject;

      }



      return;

    }



    const imageSource = resolveImageSource(source);



    if (!imageSource) {

      reject(new Error("A valid image URL is required."));

      return;

    }



    const image = new Image();



    if (shouldUseCrossOrigin(imageSource)) {

      image.crossOrigin = "anonymous";

      image.referrerPolicy = "no-referrer";

    }



    image.onload = () => resolve(image);

    image.onerror = () => {

      reject(

        new Error(

          `Unable to load texture image: ${imageSource}. If this is a remote public URL, the server must allow CORS for WebGL textures.`,

        ),

      );

    };

    image.src = imageSource;

  });

}



function createImageTexture(

  gl: WebGL2RenderingContext,

  image: HTMLImageElement,

  unit: number,

  shouldRepeat = false,

) {

  const texture = gl.createTexture() as WebGLTexture;



  gl.activeTexture(gl.TEXTURE0 + unit);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);



  gl.texParameteri(

    gl.TEXTURE_2D,

    gl.TEXTURE_WRAP_S,

    shouldRepeat ? gl.REPEAT : gl.CLAMP_TO_EDGE,

  );



  gl.texParameteri(

    gl.TEXTURE_2D,

    gl.TEXTURE_WRAP_T,

    shouldRepeat ? gl.REPEAT : gl.CLAMP_TO_EDGE,

  );



  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);



  return texture;

}



function createMaskTexture(

  gl: WebGL2RenderingContext,

  maskCanvas: HTMLCanvasElement,

  unit: number,

) {

  const texture = gl.createTexture() as WebGLTexture;



  gl.activeTexture(gl.TEXTURE0 + unit);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);



  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);



  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);



  return texture;

}



function isPointInsideRect(clientX: number, clientY: number, rect: DOMRect) {

  return (

    clientX >= rect.left &&

    clientX <= rect.right &&

    clientY >= rect.top &&

    clientY <= rect.bottom

  );

}



function getNormalizedPointer(clientX: number, clientY: number, rect: DOMRect) {

  return {

    x: (clientX - rect.left) / rect.width,

    y: (clientY - rect.top) / rect.height,

  };

}



function drawTrailStamp(

  ctx: CanvasRenderingContext2D,

  x: number,

  y: number,

  radius: number,

  softRadius: number,

) {

  const gradient = ctx.createRadialGradient(

    x,

    y,

    radius * 0.1,

    x,

    y,

    softRadius,

  );



  gradient.addColorStop(0, "rgba(255,255,255,1)");

  gradient.addColorStop(0.35, "rgba(255,255,255,0.72)");

  gradient.addColorStop(1, "rgba(255,255,255,0)");



  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = gradient;

  ctx.beginPath();

  ctx.arc(x, y, softRadius, 0, Math.PI * 2);

  ctx.fill();

}



function clampNumber(

  value: unknown,

  min: number,

  max: number,

  fallback: number,

) {

  const numericValue = Number(value);



  if (!Number.isFinite(numericValue)) {

    return fallback;

  }



  return Math.min(max, Math.max(min, numericValue));

}



interface PointerState {

  isInside: boolean;

  targetX: number;

  targetY: number;

  x: number;

  y: number;

  previousX: number;

  previousY: number;

  lastTime: number;

  lastMoveTime: number;

  hasDrawn: boolean;

}



export interface InteractiveBlurRevealProps {

  /** Base image: a URL (must allow CORS) or a data URI. */

  iChannel0?: any;

  /** Tiling noise texture: a URL (must allow CORS) or a data URI. */

  iChannel1?: any;

  className?: string;

  style?: CSSProperties;

  /** Radius of the cursor reveal mask, in canvas pixels. */

  mouseRadius?: number;

  /** Enable pointer-driven reveal drawing. */

  mouseInteraction?: boolean;

  /** Trail persistence and fade duration, in seconds. */

  duration?: number;

}



function InteractiveBlurReveal({

  iChannel0 = DEFAULT_BASE_TEXTURE,

  iChannel1 = DEFAULT_NOISE_TEXTURE,

  mouseRadius = DEFAULT_MOUSE_RADIUS,

  mouseInteraction = true,

  duration = DEFAULT_DURATION,

  className,

  style,

}: InteractiveBlurRevealProps) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  const configRef = useRef({

    mouseRadius: DEFAULT_MOUSE_RADIUS,

    mouseInteraction: true,

    duration: DEFAULT_DURATION,

  });



  useEffect(() => {

    configRef.current = {

      mouseRadius: clampNumber(mouseRadius, 40, 420, DEFAULT_MOUSE_RADIUS),

      mouseInteraction,

      duration: clampNumber(duration, 0.08, 1.5, DEFAULT_DURATION),

    };

  }, [duration, mouseInteraction, mouseRadius]);



  const pointerRef = useRef<PointerState>({

    isInside: false,

    targetX: DEFAULT_POINTER_POSITION,

    targetY: DEFAULT_POINTER_POSITION,

    x: DEFAULT_POINTER_POSITION,

    y: DEFAULT_POINTER_POSITION,

    previousX: DEFAULT_POINTER_POSITION,

    previousY: DEFAULT_POINTER_POSITION,

    lastTime: 0,

    lastMoveTime: 0,

    hasDrawn: false,

  });



  useEffect(() => {

    let isDisposed = false;

    let loop: ReturnType<typeof createSuspendedRaf> | null = null;

    let cleanupWebgl: (() => void) | undefined;



    async function init() {

      if (!canvasRef.current) return undefined;

      const canvas = canvasRef.current as HTMLCanvasElement;



      if (!canvas) return undefined;



      const gl = canvas.getContext("webgl2", {

        alpha: false,

        antialias: false,

        preserveDrawingBuffer: false,

      })!;



      if (!gl) {

        console.error("WebGL2 is required for this shader.");

        return undefined;

      }



      const maskCanvas = document.createElement("canvas");

      const maskCtx = maskCanvas.getContext("2d", {

        alpha: true,

        willReadFrequently: false,

      })!;



      if (!maskCtx) return undefined;



      const program = createProgram(gl, BLUR_REVEAL_VERT, BLUR_REVEAL_FRAG);

      const positionBuffer = gl.createBuffer();



      const positionLocation = gl.getAttribLocation(program, "position");

      const resolutionLocation = gl.getUniformLocation(program, "iResolution");

      const timeLocation = gl.getUniformLocation(program, "iTime");

      const channel0Location = gl.getUniformLocation(program, "iChannel0");

      const channel1Location = gl.getUniformLocation(program, "iChannel1");

      const maskLocation = gl.getUniformLocation(program, "iMask");



      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE_VERTICES, gl.STATIC_DRAW);

      gl.enableVertexAttribArray(positionLocation);

      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);



      const [baseImage, noiseImage] = await Promise.all([

        loadImage(iChannel0),

        loadImage(iChannel1),

      ]);



      if (isDisposed) {

        gl.deleteBuffer(positionBuffer);

        gl.deleteProgram(program);

        return undefined;

      }



      const baseTexture = createImageTexture(gl, baseImage, TEXTURE_UNIT_BASE);

      const noiseTexture = createImageTexture(

        gl,

        noiseImage,

        TEXTURE_UNIT_NOISE,

        true,

      );



      const maskTexture = createMaskTexture(gl, maskCanvas, TEXTURE_UNIT_MASK);



      gl.uniform1i(channel0Location, TEXTURE_UNIT_BASE);

      gl.uniform1i(channel1Location, TEXTURE_UNIT_NOISE);

      gl.uniform1i(maskLocation, TEXTURE_UNIT_MASK);



      function resize() {

        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        const nextWidth = Math.floor(window.innerWidth * devicePixelRatio);

        const nextHeight = Math.floor(window.innerHeight * devicePixelRatio);



        if (canvas.width === nextWidth && canvas.height === nextHeight) return;



        canvas.width = nextWidth;

        canvas.height = nextHeight;

        canvas.style.width = "100vw";

        canvas.style.height = "100vh";



        maskCanvas.width = nextWidth;

        maskCanvas.height = nextHeight;



        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);



        gl.viewport(0, 0, canvas.width, canvas.height);



        gl.activeTexture(gl.TEXTURE0 + TEXTURE_UNIT_MASK);

        gl.bindTexture(gl.TEXTURE_2D, maskTexture);



        gl.texImage2D(

          gl.TEXTURE_2D,

          0,

          gl.RGBA,

          gl.RGBA,

          gl.UNSIGNED_BYTE,

          maskCanvas,

        );

      }



      function updatePointerFromClient(clientX: number, clientY: number) {

        const rect = canvas.getBoundingClientRect();

        const pointer = pointerRef.current;

        const isInside = isPointInsideRect(clientX, clientY, rect);



        pointer.isInside = isInside;



        if (!isInside) return;



        const normalized = getNormalizedPointer(clientX, clientY, rect);



        pointer.targetX = normalized.x;

        pointer.targetY = normalized.y;

        pointer.lastMoveTime = performance.now();

      }



      function onWindowPointerMove(event: PointerEvent) {

        updatePointerFromClient(event.clientX, event.clientY);

      }



      function onWindowPointerLeave(event: MouseEvent) {

        if (!event.relatedTarget) {

          const pointer = pointerRef.current;



          pointer.isInside = false;

          pointer.hasDrawn = false;

        }

      }



      function fadeMask(now: number, pointer: PointerState) {

        const durationMs = configRef.current.duration * 1000;

        const idleAge = now - pointer.lastMoveTime;

        const idleFade = clampNumber(

          MASK_IDLE_FADE_ALPHA * (DEFAULT_DURATION / configRef.current.duration),

          0.015,

          0.22,

          MASK_IDLE_FADE_ALPHA,

        );

        const activeFade = clampNumber(

          MASK_FADE_ALPHA * (DEFAULT_DURATION / configRef.current.duration),

          0.003,

          0.08,

          MASK_FADE_ALPHA,

        );

        const fadeAlpha = idleAge > durationMs ? idleFade : activeFade;



        maskCtx.save();

        maskCtx.globalCompositeOperation = "destination-out";

        maskCtx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;

        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        maskCtx.restore();

      }



      function drawTrail(pointer: PointerState, velocity: number, now: number) {

        const durationMs = configRef.current.duration * 1000;

        const radius = configRef.current.mouseRadius;

        const softRadius = radius * 1.17;

        const lineWidth = radius * 1.05;

        const idleAge = now - pointer.lastMoveTime;



        const shouldDraw =

          configRef.current.mouseInteraction &&

          pointer.isInside &&

          idleAge <= durationMs &&

          velocity > STOP_VELOCITY_EPSILON;



        if (!shouldDraw) {

          pointer.hasDrawn = false;

          return;

        }



        const currentX = pointer.x * maskCanvas.width;

        const currentY = pointer.y * maskCanvas.height;

        const previousX = pointer.previousX * maskCanvas.width;

        const previousY = pointer.previousY * maskCanvas.height;



        maskCtx.save();



        maskCtx.globalCompositeOperation = "source-over";

        maskCtx.lineCap = "round";

        maskCtx.lineJoin = "round";

        maskCtx.strokeStyle = "rgba(255,255,255,0.72)";

        maskCtx.lineWidth = lineWidth;



        if (pointer.hasDrawn) {

          maskCtx.beginPath();

          maskCtx.moveTo(previousX, previousY);

          maskCtx.lineTo(currentX, currentY);

          maskCtx.stroke();

        }



        drawTrailStamp(maskCtx, currentX, currentY, radius, softRadius);



        maskCtx.restore();



        pointer.hasDrawn = true;

      }



      function uploadMaskTexture() {

        gl.activeTexture(gl.TEXTURE0 + TEXTURE_UNIT_MASK);

        gl.bindTexture(gl.TEXTURE_2D, maskTexture);



        gl.texSubImage2D(

          gl.TEXTURE_2D,

          0,

          0,

          0,

          gl.RGBA,

          gl.UNSIGNED_BYTE,

          maskCanvas,

        );

      }



      function render() {

        resize();



        const now = performance.now();

        const pointer = pointerRef.current;



        const frameDelta = pointer.lastTime

          ? Math.min(MAX_FRAME_DELTA_MS, now - pointer.lastTime)

          : DEFAULT_FRAME_TIME_MS;



        pointer.lastTime = now;



        const smoothing = configRef.current.mouseInteraction

          ? 1.0 - Math.pow(POINTER_LERP_FACTOR, frameDelta / 1000)

          : 0;



        pointer.previousX = pointer.x;

        pointer.previousY = pointer.y;



        pointer.x += (pointer.targetX - pointer.x) * smoothing;

        pointer.y += (pointer.targetY - pointer.y) * smoothing;



        const velocityX = pointer.x - pointer.previousX;

        const velocityY = pointer.y - pointer.previousY;

        const velocity = Math.hypot(velocityX, velocityY);



        fadeMask(now, pointer);

        drawTrail(pointer, velocity, now);

        uploadMaskTexture();



        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        gl.uniform1f(timeLocation, now / 1000);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

      }



      window.addEventListener("pointermove", onWindowPointerMove, {

        passive: true,

      });

      window.addEventListener("mouseout", onWindowPointerLeave);



      loop = createSuspendedRaf({

        root: canvas,

        onFrame: render,

      });

      loop.start();



      return () => {

        window.removeEventListener("pointermove", onWindowPointerMove);

        window.removeEventListener("mouseout", onWindowPointerLeave);



        loop?.destroy();

        loop = null;

        gl.deleteTexture(baseTexture);

        gl.deleteTexture(noiseTexture);

        gl.deleteTexture(maskTexture);

        gl.deleteBuffer(positionBuffer);

        gl.deleteProgram(program);

      };

    }



    const boot = () => {

      init()

        .then((cleanup) => {

          if (isDisposed) {

            if (cleanup) cleanup();

            return;

          }

          cleanupWebgl = cleanup;

        })

        .catch((error) => {

          console.warn(

            "InteractiveBlurReveal could not initialize. The provided texture URL must be directly loadable by the browser and must allow CORS for WebGL.",

            error?.message || error,

          );

        });

    };



    const detachRecovery = attachWebGLContextRecovery(canvasRef.current, {

      onLost: () => {

        if (cleanupWebgl) {

          cleanupWebgl();

          cleanupWebgl = undefined;

        } else {

          loop?.destroy();

          loop = null;

        }

      },

      onRestored: () => {

        if (!isDisposed) boot();

      },

    });



    boot();



    return () => {

      isDisposed = true;

      detachRecovery();



      if (cleanupWebgl) {

        cleanupWebgl();

      } else {

        loop?.destroy();

        loop = null;

      }

    };

  }, [iChannel0, iChannel1]);



  function updatePointerFromEvent(event: ReactPointerEvent) {

    if (!mouseInteraction) return;

    const canvas = canvasRef.current;



    if (!canvas) return;



    const rect = canvas.getBoundingClientRect();

    const pointer = pointerRef.current;

    const normalized = getNormalizedPointer(event.clientX, event.clientY, rect);



    pointer.isInside = true;

    pointer.targetX = normalized.x;

    pointer.targetY = normalized.y;

    pointer.lastMoveTime = performance.now();

  }



  function onPointerEnter(event: ReactPointerEvent) {

    updatePointerFromEvent(event);

  }



  function onPointerMove(event: ReactPointerEvent) {

    updatePointerFromEvent(event);

  }



  function onPointerLeave() {

    const pointer = pointerRef.current;



    pointer.isInside = false;

    pointer.hasDrawn = false;

  }



  return (

    <>

      <canvas

        ref={canvasRef}

        aria-hidden="true"

        onPointerEnter={onPointerEnter}

        onPointerMove={onPointerMove}

        onPointerLeave={onPointerLeave}

        className={className}

        style={{

          position: "fixed",

          inset: 0,

          width: "100vw",

          height: "100vh",

          display: "block",

          ...style,

        }}

      />



      {prefersReducedMotion && (

        <div

          aria-live="polite"

          className="pointer-events-none fixed top-26 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-md:hidden"

        >

          <h2 className="text-sm leading-none text-white">

            The reveal keeps trailing.

          </h2>

          <p className="mt-2 text-xs leading-5 text-white/65">

            Interactive Blur Reveal clears the blur only where your cursor

            has recently moved, redrawing continuously. Since the reveal is

            driven entirely by motion, reduced motion can&apos;t be applied

            here.

          </p>

        </div>

      )}

    </>

  );

}



export default InteractiveBlurReveal;