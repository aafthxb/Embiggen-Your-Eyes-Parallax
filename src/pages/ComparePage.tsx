// ComparePage.tsx
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  SplitSquareVertical,
  Rows3,
  Blend,
  Circle,
  Dice6,
  MoveHorizontal,
  Info,
  Maximize2,
  X
} from "lucide-react";
import clsx from "clsx";

// Spinner Ring Loader
const SpinnerRing = ({ size = 40 }: { size?: number }) => (
  <div
    aria-label="Loading"
    role="status"
    className="animate-spin rounded-full border-2 border-white/30 border-t-transparent"
    style={{ width: size, height: size }}
  />
);


// ---------- Types ----------
type CompareMode = "swipe" | "opacity" | "spyglass";

interface ImageSideState {
  label: "Left" | "Right";
  url: string;
  loading?: boolean;
  error?: string | null;
}

interface LayerOption {
  id: string;
  label: string;
}

interface RegionOption {
  id: string;
  label: string;
  bbox: string; // "minLon,minLat,maxLon,maxLat"
}

// ---------- Phase 1: curated layers and regions ----------
const LAYERS: LayerOption[] = [
  { id: "VIIRS_SNPP_CorrectedReflectance_TrueColor", label: "True Color (VIIRS SNPP)" },
  { id: "MODIS_Terra_CorrectedReflectance_TrueColor", label: "True Color (MODIS Terra)" },
  { id: "VIIRS_SNPP_DayNightBand_At_Sensor_Radiance", label: "Night Lights (VIIRS DNB)" },
];

const REGIONS: RegionOption[] = [
  { id: "global", label: "Global", bbox: "-180,-90,180,90" },
  { id: "california", label: "California", bbox: "-125,32,-113,43" },
  { id: "amazon", label: "Amazon", bbox: "-75,-15,-50,5" },
  { id: "himalayas", label: "Himalayas", bbox: "70,20,100,40" },
];

// ---------- Small helpers ----------
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const todayISO = isoDate(new Date());
const yesterdayISO = isoDate(new Date(Date.now() - 24 * 3600 * 1000));

// Radix Slider wrapper (kept for opacity and lens)
function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(vals) => onValueChange(vals[0] ?? value)}
      className={clsx("relative flex items-center select-none touch-none w-full h-5", className)}
    >
      <SliderPrimitive.Track className="relative grow rounded-full h-1 bg-white/20">
        <SliderPrimitive.Range className="absolute h-full bg-primary rounded-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block size-4 rounded-full bg-primary border border-white/30 shadow focus:outline-none focus:ring-2 focus:ring-primary/60"
        aria-label="Slider"
      />
    </SliderPrimitive.Root>
  );
}

// ---------- CompareCanvas: high-performance swipe + spyglass ----------
function CompareCanvas({
  leftUrl,
  rightUrl,
  mode,
  swipe,
  opacity,
  spyglassRadius,
  onSwipeChange,
  isLoading,                // NEW: show overlay when true
  onLeftLoad,               // NEW
  onRightLoad,              // NEW
  onLeftError,              // NEW
  onRightError,             // NEW
}: {
  leftUrl: string;
  rightUrl: string;
  mode: CompareMode;          // "swipe" | "opacity" | "spyglass"
  swipe: number;              // 0..100
  opacity: number;            // 0..100
  spyglassRadius: number;     // px
  onSwipeChange: (pct: number) => void;
  isLoading: boolean;         // NEW
  onLeftLoad: () => void;     // NEW
  onRightLoad: () => void;    // NEW
  onLeftError: (msg: string) => void;   // NEW
  onRightError: (msg: string) => void;  // NEW
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLImageElement | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const rafRef = useRef<number | null>(null);
  const pendingPctRef = useRef<number>(swipe);

  const clampPercent = (clientX: number) => {
    if (!containerRef.current) return 50;
    const rect = containerRef.current.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, p));
  };

  const clampCursor = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return { x, y };
  }, []);

  const applyClip = (pct: number) => {
    if (!overlayRef.current) return;
    overlayRef.current.style.transition = "none";
    overlayRef.current.style.willChange = "clip-path";
    overlayRef.current.style.clipPath = `inset(0 0 0 ${pct}%)`;
  };

  const scheduleApply = (pct: number) => {
    pendingPctRef.current = pct;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        applyClip(pendingPctRef.current);
        rafRef.current = null;
      });
    }
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === "swipe") {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      scheduleApply(clampPercent(e.clientX));
      e.preventDefault();
      return;
    }
    if (mode === "spyglass") {
      const c = clampCursor(e.clientX, e.clientY);
      if (c) setCursor(c);
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    }
  }, [mode, clampCursor]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === "swipe") {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        scheduleApply(clampPercent(e.clientX));
      }
      return;
    }
    if (mode === "spyglass") {
      const c = clampCursor(e.clientX, e.clientY);
      if (c) setCursor(c);
    }
  }, [mode, clampCursor]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (mode === "swipe") {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      onSwipeChange(pendingPctRef.current);
      return;
    }
    if (mode === "spyglass") {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
  }, [mode, onSwipeChange]);

  const onPointerLeave = useCallback(() => {
    if (mode === "spyglass") setCursor(null);
  }, [mode]);

  useEffect(() => {
    if (mode === "swipe") {
      applyClip(Math.max(0, Math.min(100, swipe)));
    }
  }, [mode, swipe]);

  const swipePct = Math.max(0, Math.min(100, swipe));
  const opacityPct = Math.max(0, Math.min(100, opacity)) / 100;
  const wantsTouchNone = mode === "swipe" || mode === "spyglass";

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative w-full h-[60vh] md:h-[65vh] lg:h-[70vh] rounded-xl overflow-hidden glass-panel select-none",
        wantsTouchNone && "touch-none"
      )}
      style={{ touchAction: wantsTouchNone ? "none" as const : undefined, contain: "paint" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/40 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <SpinnerRing />
            <span className="text-xs text-white/80">Loading images…</span>
          </div>
        </div>
      )}

      {/* Base image (Left) */}
      <img
        src={leftUrl}
        alt="Left"
        decoding="async"
        loading="eager"
        className="absolute inset-0 w-full h-full object-contain bg-black/30 pointer-events-none"
        draggable={false}
        onLoad={onLeftLoad}                            // NEW
        onError={() => onLeftError("Left image failed to load")} // NEW
      />

      {/* Overlay image (Right) for swipe/opacity ONLY */}
      {(mode === "swipe" || mode === "opacity") && (
        <img
          ref={overlayRef}
          src={rightUrl}
          alt="Right"
          decoding="async"
          draggable={false}
          className={clsx(
            "absolute inset-0 w-full h-full object-contain pointer-events-none",
            mode !== "swipe" && "transition-[opacity,clip-path] duration-150"
          )}
          style={
            mode === "swipe"
              ? { clipPath: `inset(0 0 0 ${swipePct}%)`, willChange: "clip-path", transform: "translate3d(0,0,0)" }
              : { opacity: opacityPct }
          }
          onLoad={onRightLoad}                           // NEW
          onError={() => onRightError("Right image failed to load")} // NEW
        />
      )}

      {/* Swipe divider + handle */}
      {mode === "swipe" && (
        <>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
            style={{ left: `${swipePct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 -ml-3"
            style={{ left: `${swipePct}%`, width: "24px" }}
          >
            <button
              type="button"
              aria-label="Swipe divider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(swipePct)}
              role="slider"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  const delta = e.key === "ArrowLeft" ? -2 : 2;
                  onSwipeChange(Math.max(0, Math.min(100, swipe + delta)));
                  e.preventDefault();
                }
                if (e.key === "Home") { onSwipeChange(0); e.preventDefault(); }
                if (e.key === "End") { onSwipeChange(100); e.preventDefault(); }
              }}
              className="relative h-full w-full cursor-col-resize bg-transparent focus:outline-none"
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/70 text-white text-xs flex items-center gap-1">
                <MoveHorizontal className="h-4 w-4" />
                {Math.round(swipePct)}%
              </div>
            </button>
          </div>
        </>
      )}

      {/* Spyglass overlay (only in spyglass mode) */}
      {mode === "spyglass" && (
        <>
          <img
            src={rightUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              clipPath: cursor
                ? `circle(${spyglassRadius}px at ${cursor.x}px ${cursor.y}px)`
                : `circle(0px at 50% 50%)`,
              willChange: "clip-path",
              transform: "translate3d(0,0,0)",
            }}
            onLoad={onRightLoad}                           // ensure spyglass path clears loading too
            onError={() => onRightError("Right image failed to load")}
          />
          {cursor && (
            <div
              className="pointer-events-none absolute"
              style={{ left: cursor.x - 8, top: cursor.y - 8 }}
            >
              <div className="size-4 rounded-full border border-white/80" />
            </div>
          )}
        </>
      )}
    </div>
  );
}


// ---------- Phase 1: Snapshot fetch ----------
function snapshotUrl(params: {
  time: string;                 // "YYYY-MM-DD"
  bbox: string;                 // "minLon,minLat,maxLon,maxLat"
  layers: string;               // comma-separated layer ids
  width?: number;               // e.g., 1536
  height?: number;              // e.g., 1536
  format?: "image/png" | "image/jpeg";
  crs?: "EPSG:4326" | "EPSG:3857";
}) {
  const search = new URLSearchParams({
    REQUEST: "GetSnapshot",
    TIME: params.time,
    BBOX: params.bbox,
    CRS: params.crs ?? "EPSG:4326",
    LAYERS: params.layers,
    FORMAT: params.format ?? "image/png",
    WIDTH: String(params.width ?? 1536),
    HEIGHT: String(params.height ?? 1536),
  });
  return `https://wvs.earthdata.nasa.gov/api/v1/snapshot?${search.toString()}`;
}


// ---------- Main Page ----------
const ComparePage = () => {
  // Compare images
  const [left, setLeft] = useState<ImageSideState>({ label: "Left", url: "" });
  const [right, setRight] = useState<ImageSideState>({ label: "Right", url: "" });

  // Compare mode + params
  const [mode, setMode] = useState<CompareMode>("swipe");
  const [swipe, setSwipe] = useState<number>(50);
  const [blend, setBlend] = useState<number>(60);
  const [lens, setLens] = useState<number>(140);

  // Phase 1: data picker state
  const [sync, setSync] = useState<boolean>(true);

  const [leftLayer, setLeftLayer] = useState<string>(LAYERS[0].id);
  const [rightLayer, setRightLayer] = useState<string>(LAYERS[0].id);

  const [leftDate, setLeftDate] = useState<string>(todayISO);
  const [rightDate, setRightDate] = useState<string>(yesterdayISO);

  const [regionId, setRegionId] = useState<string>(REGIONS[0].id);
  const [customBbox, setCustomBbox] = useState<string>(""); // overrides preset when set

  const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsFullscreen(false);
    };
    if (isFullscreen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    }, [isFullscreen]);


  const currentRegion = useMemo(
    () => REGIONS.find((r) => r.id === regionId) ?? REGIONS[0],
    [regionId]
  );

  // Sync handling: when ON, mirror right from left for layer/date/region
  useEffect(() => {
    if (sync) {
      setRightLayer(leftLayer);
      setRightDate(leftDate);
    }
  }, [sync, leftLayer, leftDate]);

  // Kickoff initial fetch once
  useEffect(() => {
    void handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFetch() {
  const bbox = customBbox.trim() || currentRegion.bbox;

  setLeft((s) => ({ ...s, loading: true, error: null }));
  setRight((s) => ({ ...s, loading: true, error: null }));

  try {
    const leftSrc = snapshotUrl({
      time: leftDate,
      bbox,
      layers: leftLayer,
      width: 1536,
      height: 1536,
      format: "image/png",
      crs: "EPSG:4326",
    });

    const rightSrc = snapshotUrl({
      time: rightDate,
      bbox,
      layers: rightLayer,
      width: 1536,
      height: 1536,
      format: "image/png",
      crs: "EPSG:4326",
    });

    setLeft((s) => ({ ...s, url: leftSrc}));
    setRight((s) => ({ ...s, url: rightSrc}));
  } catch (err: any) {
    const msg = err?.message || "Failed to build Worldview snapshot URLs";
    setLeft((s) => ({ ...s, loading: false, error: msg }));
    setRight((s) => ({ ...s, loading: false, error: msg }));
  }
}


  // Mode control UI (no slider for swipe)
  const modeControl = useMemo(() => {
    if (mode === "swipe") return null;
    if (mode === "opacity") {
      return (
        <div className="flex items-center gap-3 w-full max-w-xl">
          <Blend className="h-4 w-4 text-white/80" />
          <Slider value={blend} onValueChange={setBlend} className="flex-1" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3 w-full max-w-xl">
        <Circle className="h-4 w-4 text-white/80" />
        <Slider value={lens} onValueChange={setLens} min={60} max={260} step={10} className="flex-1" />
      </div>
    );
  }, [mode, blend, lens]);

  // Small helpers to bump dates
  function shiftDate(d: string, delta: number) {
    const t = new Date(d);
    t.setDate(t.getDate() + delta);
    return isoDate(t);
  }

  // ---------- UI ----------
  return (
    <div className="min-h-screen space-gradient relative">
      {/* Top bar */}
      <header className="container mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Gallery
            </Button>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <SplitSquareVertical className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold gradient-text">Compare</h1>
          </div>
        </div>
      </header>

      {/* Setup bar (Phase 1 additions) */}
      <section className="container mx-auto px-4">
        <div className="glass-panel rounded-xl p-4 flex flex-col gap-4">
          {/* Sync + Region row */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <label className="text-white/90 text-sm">Sync Left & Right</label>
              <button
                type="button"
                onClick={() => setSync((s) => !s)}
                className={clsx(
                  "h-8 px-3 rounded-md border border-white/15",
                  sync ? "bg-primary/40" : "bg-black/40"
                )}
              >
                {sync ? "On" : "Off"}
              </button>
            </div>

            {/* Mobile-responsive region + fetch section */}
<div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
  <div className="flex items-center gap-3">
    <span className="text-white/90 text-sm">Region</span>
    <select
      value={regionId}
      onChange={(e) => setRegionId(e.target.value)}
      className="bg-black/40 text-white rounded-md px-3 py-2 border border-white/15"
    >
      {REGIONS.map((r) => (
        <option key={r.id} value={r.id}>
          {r.label}
        </option>
      ))}
    </select>
  </div>
  
  <div className="flex flex-col sm:flex-row gap-2">
    <Input
      value={customBbox}
      onChange={(e) => setCustomBbox(e.target.value)}
      placeholder="Custom bbox (minLon,minLat,maxLon,maxLat)"
      className="flex-1 min-w-0"
    />

            </div>
            </div>

          </div>

          {/* Left/Right configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left */}
            <Card className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-blue-400" />
                  <h3 className="font-semibold">Left</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const i = Math.floor(Math.random() * LAYERS.length);
                      setLeftLayer(LAYERS[i].id);
                      if (sync) setRightLayer(LAYERS[i].id);
                    }}
                  >
                    <Dice6 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-white/80">Layer</span>
                  <select
                    value={leftLayer}
                    onChange={(e) => {
                      setLeftLayer(e.target.value);
                      if (sync) setRightLayer(e.target.value);
                    }}
                    className="bg-black/40 text-white rounded-md px-3 py-2 border border-white/15 flex-1"
                  >
                    {LAYERS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
  <span className="w-16 text-sm text-white/80 shrink-0">Date</span>
  <Input
    type="date"
    value={leftDate}
    onChange={(e) => {
      setLeftDate(e.target.value);
      if (sync) setRightDate(e.target.value);
    }}
    className="min-w-0 flex-[1_1_160px]"  // allow shrinking, base width ~160px
  />
  <div className="flex items-center gap-2 shrink-0">
    <Button
      variant="outline"
      onClick={() => {
        const nd = shiftDate(leftDate, -1);
        setLeftDate(nd);
        if (sync) setRightDate(nd);
      }}
      className="px-3"
    >
      −1d
    </Button>
    <Button
      variant="outline"
      onClick={() => {
        const nd = shiftDate(leftDate, +1);
        setLeftDate(nd);
        if (sync) setRightDate(nd);
      }}
      className="px-3"
    >
      +1d
    </Button>
  </div>
</div>

              </div>
            </Card>

            {/* Right */}
            <Card className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-pink-400" />
                  <h3 className="font-semibold">Right</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const i = Math.floor(Math.random() * LAYERS.length);
                      setRightLayer(LAYERS[i].id);
                      if (sync) setLeftLayer(LAYERS[i].id);
                    }}
                  >
                    <Dice6 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-white/80">Layer</span>
                  <select
                    value={rightLayer}
                    onChange={(e) => {
                      setRightLayer(e.target.value);
                      if (sync) setLeftLayer(e.target.value);
                    }}
                    className="bg-black/40 text-white rounded-md px-3 py-2 border border-white/15 flex-1"
                  >
                    {LAYERS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
  <span className="w-16 text-sm text-white/80 shrink-0">Date</span>
  <Input
    type="date"
    value={rightDate}
    onChange={(e) => {
      setRightDate(e.target.value);
      if (sync) setLeftDate(e.target.value);
    }}
    className="min-w-0 flex-[1_1_160px]"
  />
  <div className="flex items-center gap-2 shrink-0">
    <Button variant="outline" onClick={() => setRightDate(shiftDate(rightDate, -1))} className="px-3">
      −1d
    </Button>
    <Button variant="outline" onClick={() => setRightDate(shiftDate(rightDate, +1))} className="px-3">
      +1d
    </Button>
  </div>
</div>
        
              </div>
              
            </Card>
          </div>
            {/* Action row: Fetch below both cards */}
<div className="flex flex-col gap-2 mt-2">
  <div className="flex justify-center">
    <Button
        onClick={handleFetch}
        disabled={left.loading || right.loading}
        className="w-full sm:w-auto px-6"
        >
        {(left.loading || right.loading) ? (
            <span className="inline-flex items-center gap-2">
            <SpinnerRing size={18} />
            Fetching…
            </span>
        ) : (
            "Fetch"
        )}
    </Button>

  </div>
  {/* Optional helper text */}
  <p className="text-center text-xs text-white/70">
    Make selections above, then Fetch to load images from NASA Worldview.
  </p>
</div>

          {/* Mode + controls */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2">
              <Rows3 className="h-5 w-5 text-white/80" />
              <span className="text-sm md:text-base text-white/90">Mode</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={clsx(
                  "px-3 py-2 text-sm rounded-lg border border-white/15 bg-black/40 hover:bg-black/50",
                  mode === "swipe" && "bg-primary/30"
                )}
                onClick={() => setMode("swipe")}
              >
                Swipe
              </button>
              <button
                className={clsx(
                  "px-3 py-2 text-sm rounded-lg border border-white/15 bg-black/40 hover:bg-black/50",
                  mode === "opacity" && "bg-primary/30"
                )}
                onClick={() => setMode("opacity")}
              >
                Opacity
              </button>
              <button
                className={clsx(
                  "px-3 py-2 text-sm rounded-lg border border-white/15 bg-black/40 hover:bg-black/50",
                  mode === "spyglass" && "bg-primary/30"
                )}
                onClick={() => setMode("spyglass")}
              >
                Spyglass
              </button>
            </div>

            <div className="flex-1">{modeControl}</div>
          </div>
        </div>
      </section>

      {/* Viewer */}
        <main className="container mx-auto px-4 mt-4">
        <div className="relative">
            {/* Fullscreen toggle */}
            <div className="absolute top-3 right-3 z-20">
            <Button
                variant="secondary"
                size="icon"
                aria-label="Enter fullscreen"
                onClick={() => setIsFullscreen(true)}
            >
                <Maximize2 className="h-4 w-4" />
            </Button>
            </div>

            <CompareCanvas
            leftUrl={left.url}
            rightUrl={right.url}
            mode={mode}
            swipe={swipe}
            opacity={blend}
            spyglassRadius={lens}
            onSwipeChange={setSwipe}
            isLoading={!!(left.loading || right.loading)}
            onLeftLoad={() => setLeft((s) => ({ ...s, loading: false, error: null }))}
            onRightLoad={() => setRight((s) => ({ ...s, loading: false, error: null }))}
            onLeftError={(msg) => setLeft((s) => ({ ...s, loading: false, error: msg }))}
            onRightError={(msg) => setRight((s) => ({ ...s, loading: false, error: msg }))}
            />
        </div>
        </main>


      {/* Status + messages */}
      <section className="container mx-auto px-4 mt-4 pb-10">
        <div className="glass-panel rounded-lg p-3 text-sm text-white/90 flex flex-col gap-2">
          <div className="flex flex-wrap gap-3">
            <span>Left: {leftLayer} • {leftDate}</span>
            <span>Right: {rightLayer} • {rightDate}</span>
            <span>Region: {customBbox.trim() || currentRegion.label} ({customBbox.trim() ? customBbox : currentRegion.bbox})</span>
          </div>
          {(left.loading || right.loading) && (
            <div className="text-white/70">Loading snapshots…</div>
          )}
          {(left.error || right.error) && (
            <div className="text-red-300">Couldn’t load one or both images. Try another date or layer.</div>
          )}
          {!left.url && !right.url && (
            <div className="text-white/70 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Tip: Start with True Color today vs yesterday, then try Night Lights for the same area at night.
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen overlay */}
{isFullscreen && (
  <div className="fixed inset-0 z-[100] bg-black">
    {/* Top bar with close */}
    <div className="flex items-center justify-between px-4 py-3">
      <h2 className="text-white/90 text-sm">Fullscreen Compare</h2>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Exit fullscreen"
        onClick={() => setIsFullscreen(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>

    {/* Controls (mode + sliders) */}
    <div className="px-4">
      <div className="glass-panel rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <Rows3 className="h-5 w-5 text-white/80" />
          <span className="text-sm md:text-base text-white/90">Mode</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 text-sm rounded-lg border border-white/15 bg-black/40 hover:bg-black/50 ${mode === "swipe" ? "bg-primary/30" : ""}`}
            onClick={() => setMode("swipe")}
          >
            Swipe
          </button>
          <button
            className={`px-3 py-2 text-sm rounded-lg border border-white/15 bg-black/40 hover:bg-black/50 ${mode === "opacity" ? "bg-primary/30" : ""}`}
            onClick={() => setMode("opacity")}
          >
            Opacity
          </button>
          <button
            className={`px-3 py-2 text-sm rounded-lg border border-white/15 bg-black/40 hover:bg-black/50 ${mode === "spyglass" ? "bg-primary/30" : ""}`}
            onClick={() => setMode("spyglass")}
          >
            Spyglass
          </button>
        </div>

        <div className="flex-1">
          {mode === "opacity" && (
            <div className="flex items-center gap-3 w-full max-w-xl">
              <Blend className="h-4 w-4 text-white/80" />
              <Slider value={blend} onValueChange={setBlend} className="flex-1" />
            </div>
          )}
          {mode === "spyglass" && (
            <div className="flex items-center gap-3 w-full max-w-xl">
              <Circle className="h-4 w-4 text-white/80" />
              <Slider value={lens} onValueChange={setLens} min={60} max={260} step={10} className="flex-1" />
            </div>
          )}
          {/* No slider for swipe (on-canvas divider) */}
        </div>
      </div>
    </div>

    {/* Fullscreen viewer */}
    <div className="px-4 py-3">
      <CompareCanvas
        leftUrl={left.url}
        rightUrl={right.url}
        mode={mode}
        swipe={swipe}
        opacity={blend}
        spyglassRadius={lens}
        onSwipeChange={setSwipe}
        isLoading={!!(left.loading || right.loading)}
        onLeftLoad={() => setLeft((s) => ({ ...s, loading: false, error: null }))}
        onRightLoad={() => setRight((s) => ({ ...s, loading: false, error: null }))}
        onLeftError={(msg) => setLeft((s) => ({ ...s, loading: false, error: msg }))}
        onRightError={(msg) => setRight((s) => ({ ...s, loading: false, error: msg }))}
      />
    </div>
  </div>
)}

    </div>
  );
};

export default ComparePage;
