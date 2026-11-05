"use client";

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent as ReactWheelEvent } from "react";
import { ArrowClockwise, ArrowCounterClockwise, ArrowsOut, Drop, Eraser, Eye, Eyedropper, LockSimple, Minus, PaintBucket, Palette, PaperPlaneTilt, PencilSimple, PenNib, Plus, Sliders, Square, Stack, Trash, WaveSine } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  BRUSH_COLORS,
  BRUSH_PRESETS,
  CANVAS_HEIGHT,
  CANVAS_JPEG_QUALITY,
  CANVAS_WIDTH,
  MAX_BRUSH_SIZE,
  MAX_LAYERS,
  MIN_BRUSH_SIZE,
  PAPER_PRESETS,
  applyCanvasOp,
  clampBrushSize,
  clampUnit,
  clampZoom,
  fitCanvasZoom,
  createLayer,
  emptyDrawingMessage,
  estimateDataUrlBytes,
  paintStroke,
  pointerPressure,
  rgbaToHex,
  stabilizePoint,
  type BrushKind,
  type CanvasLayer,
  type CanvasOp,
  type CanvasStroke,
  type CanvasTool,
  type ExportedDrawing,
} from "@/lib/domain/canvas";

import type { DrawingDraft } from "@/types";

export type DrawingStudioHandle = {
  exportDrawing: () => ExportedDrawing | null;
  hasMarks: () => boolean;
  exportOps: () => CanvasOp[];
  exportDraft: (id: string) => DrawingDraft | null;
};

export type StudioReference = { id: string; name: string; preview?: string };

export const DrawingStudio = forwardRef<DrawingStudioHandle, {
  actionLabel?: string;
  busy?: boolean;
  compact?: boolean;
  draftId?: string;
  ghostImage?: string;
  initialImage?: string;
  initialDraft?: DrawingDraft;
  references?: StudioReference[];
  sidebarExtra?: ReactNode;
  showAction?: boolean;
  onAutosave?: (draft: DrawingDraft) => void;
  onExport?: (drawing: ExportedDrawing) => void;
}>(function DrawingStudio({
  actionLabel = "Save drawing",
  busy = false,
  compact = false,
  draftId,
  ghostImage,
  initialImage,
  initialDraft,
  references = [],
  sidebarExtra,
  showAction = true,
  onAutosave,
  onExport,
}, ref) {
  const liveId = useId();
  const [bootDraft] = useState(initialDraft);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerCanvases = useRef(new Map<string, HTMLCanvasElement>());
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const opsRef = useRef<CanvasOp[]>([]);
  const redoRef = useRef<CanvasOp[]>([]);
  const currentRef = useRef<CanvasStroke | null>(null);
  const toolRef = useRef<CanvasTool>("ink");
  const [layers, setLayers] = useState<CanvasLayer[]>(() => (
    bootDraft?.layers.length
      ? bootDraft.layers.map(({ id, name, visible, opacity, locked }) => ({ id, name, visible, opacity, locked }))
      : [createLayer(0)]
  ));
  const [activeLayerId, setActiveLayerId] = useState(bootDraft?.activeLayerId ?? "layer-1");
  const [tool, setTool] = useState<CanvasTool>("ink");
  const [color, setColor] = useState(BRUSH_COLORS[0].value);
  const [recent, setRecent] = useState<string[]>([BRUSH_COLORS[0].value]);
  const [size, setSize] = useState(10);
  const [opacity, setOpacity] = useState(1);
  const [hardness, setHardness] = useState(1);
  const [stabilizer, setStabilizer] = useState(0.35);
  const [symmetry, setSymmetry] = useState(false);
  const [paper, setPaper] = useState<string>(bootDraft?.paperColor ?? PAPER_PRESETS[0].value);
  const [zoom, setZoom] = useState(() => (typeof window === "undefined" ? 1 : fitCanvasZoom(window.innerWidth - 24)));
  const [inspector, setInspector] = useState<"brush" | "color" | "layers" | "more">("brush");
  const userZoomed = useRef(false);
  const [opCount, setOpCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [baked, setBaked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready. Draw with a finger, mouse, or stylus.");
  const onAutosaveRef = useRef(onAutosave);
  onAutosaveRef.current = onAutosave;
  const layersRef = useRef(layers);
  const activeRef = useRef(activeLayerId);
  const colorRef = useRef(color);
  const sizeRef = useRef(size);
  const opacityRef = useRef(opacity);
  const hardnessRef = useRef(hardness);
  const stabilizerRef = useRef(stabilizer);
  const symmetryRef = useRef(symmetry);

  toolRef.current = tool;
  layersRef.current = layers;
  activeRef.current = activeLayerId;
  colorRef.current = color;
  sizeRef.current = size;
  opacityRef.current = opacity;
  hardnessRef.current = hardness;
  stabilizerRef.current = stabilizer;
  symmetryRef.current = symmetry;

  const bump = useCallback((message: string) => {
    setOpCount(opsRef.current.length);
    setRedoCount(redoRef.current.length);
    setStatus(message);
  }, []);

  const canvasFor = useCallback((layerId: string) => {
    let canvas = layerCanvases.current.get(layerId);
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      layerCanvases.current.set(layerId, canvas);
    }
    return canvas;
  }, []);

  const layerIdOf = (op: CanvasOp) => (op.type === "stroke" ? op.stroke.layerId : op.layerId);

  const rebuildLayer = useCallback((layerId: string) => {
    const ctx = canvasFor(layerId).getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (layerId === "layer-1" && baseRef.current) ctx.drawImage(baseRef.current, 0, 0);
    for (const op of opsRef.current) {
      if (layerIdOf(op) === layerId) applyCanvasOp(ctx, op);
    }
  }, [canvasFor]);

  const composite = useCallback((extra?: CanvasStroke) => {
    const display = displayRef.current?.getContext("2d");
    if (!display) return;
    display.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const layer of layersRef.current) {
      if (!layer.visible) continue;
      display.globalAlpha = layer.opacity;
      display.drawImage(canvasFor(layer.id), 0, 0);
      if (extra && extra.layerId === layer.id) paintStroke(display, extra);
    }
    display.globalAlpha = 1;
  }, [canvasFor]);

  const hasMarks = useCallback(() => baked || opsRef.current.length > 0, [baked]);

  const capture = useCallback((): ExportedDrawing | null => {
    if (!hasMarks()) return null;
    const output = document.createElement("canvas");
    output.width = CANVAS_WIDTH;
    output.height = CANVAS_HEIGHT;
    const ctx = output.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (const layer of layersRef.current) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(canvasFor(layer.id), 0, 0);
    }
    ctx.globalAlpha = 1;
    const dataUrl = output.toDataURL("image/jpeg", CANVAS_JPEG_QUALITY);
    return {
      dataUrl,
      byteLength: estimateDataUrlBytes(dataUrl),
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      paperColor: paper,
      ops: JSON.parse(JSON.stringify(opsRef.current)) as CanvasOp[],
    };
  }, [canvasFor, hasMarks, paper]);

  const snapshotDraft = useCallback((id: string): DrawingDraft | null => {
    if (!hasMarks()) return null;
    const drawing = capture();
    if (!drawing) return null;
    return {
      id,
      paperColor: drawing.paperColor,
      layers: layersRef.current.map((layer) => ({
        ...layer,
        dataUrl: canvasFor(layer.id).toDataURL("image/png"),
      })),
      activeLayerId: activeRef.current,
      composite: drawing.dataUrl,
      updatedAt: new Date().toISOString(),
    };
  }, [canvasFor, capture, hasMarks]);

  useImperativeHandle(ref, () => ({
    exportDrawing: capture,
    hasMarks,
    exportOps: () => JSON.parse(JSON.stringify(opsRef.current)) as CanvasOp[],
    exportDraft: snapshotDraft,
  }), [capture, hasMarks, snapshotDraft]);

  useEffect(() => {
    if (!draftId) return;
    const save = () => {
      const draft = snapshotDraft(draftId);
      if (draft) onAutosaveRef.current?.(draft);
    };
    const timer = window.setInterval(save, 8000);
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [draftId, snapshotDraft]);

  const rememberColor = (value: string) => {
    setColor(value);
    setRecent((current) => [value, ...current.filter((item) => item !== value)].slice(0, 8));
  };

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
      p: pointerPressure(event),
    };
  };

  const activeLayer = () => layersRef.current.find((layer) => layer.id === activeRef.current);

  const pickColor = (x: number, y: number) => {
    const ctx = displayRef.current?.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    if (pixel[3] < 16) rememberColor(paper);
    else rememberColor(rgbaToHex(pixel[0], pixel[1], pixel[2]));
  };

  const beginStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    const activeTool = toolRef.current;
    if (activeTool === "eyedropper") {
      pickColor(point.x, point.y);
      setTool("ink");
      bump("Color sampled.");
      return;
    }
    const layer = activeLayer();
    if (!layer || layer.locked) {
      bump("Unlock the layer to draw.");
      return;
    }
    if (activeTool === "fill") {
      opsRef.current = [...opsRef.current, { type: "fill", x: point.x, y: point.y, color: colorRef.current, layerId: layer.id }];
      redoRef.current = [];
      rebuildLayer(layer.id);
      composite();
      bump("Fill applied.");
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setError(null);
    const brush: CanvasStroke["tool"] = activeTool === "eraser" ? "eraser" : activeTool;
    currentRef.current = {
      tool: brush,
      color: colorRef.current,
      size: sizeRef.current,
      opacity: opacityRef.current,
      hardness: hardnessRef.current,
      symmetry: symmetryRef.current,
      layerId: layer.id,
      points: [point],
    };
    composite(currentRef.current);
  };

  const moveStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!currentRef.current) return;
    event.preventDefault();
    const raw = pointFromEvent(event);
    const last = currentRef.current.points.at(-1) ?? raw;
    currentRef.current.points.push(stabilizePoint(last, raw, stabilizerRef.current));
    composite(currentRef.current);
  };

  const endStroke = () => {
    if (!currentRef.current) return;
    opsRef.current = [...opsRef.current, { type: "stroke", stroke: currentRef.current }];
    redoRef.current = [];
    rebuildLayer(currentRef.current.layerId);
    currentRef.current = null;
    composite();
    bump("Mark added.");
    if (draftId) {
      const draft = snapshotDraft(draftId);
      if (draft) onAutosaveRef.current?.(draft);
    }
  };

  const undo = () => {
    const op = opsRef.current.pop();
    if (!op) return;
    redoRef.current.push(op);
    rebuildLayer(layerIdOf(op));
    composite();
    bump("Undo applied.");
  };

  const redo = () => {
    const op = redoRef.current.pop();
    if (!op) return;
    opsRef.current.push(op);
    rebuildLayer(layerIdOf(op));
    composite();
    bump("Redo applied.");
  };

  const clearCanvas = () => {
    opsRef.current = [];
    redoRef.current = [];
    currentRef.current = null;
    baseRef.current = null;
    setBaked(false);
    for (const layer of layersRef.current) rebuildLayer(layer.id);
    composite();
    bump("Canvas cleared.");
  };

  const selectBrush = (kind: BrushKind) => {
    const preset = BRUSH_PRESETS.find((item) => item.id === kind);
    setTool(kind);
    if (!preset) return;
    setSize(preset.size);
    setHardness(preset.hardness);
    setOpacity(preset.opacity);
  };

  const addLayer = () => {
    if (layers.length >= MAX_LAYERS) return;
      const layer = createLayer(layers.length, `layer-${Date.now().toString(36)}`);
    setLayers((current) => [...current, layer]);
    setActiveLayerId(layer.id);
    bump(`${layer.name} added.`);
  };

  const removeLayer = (id: string) => {
    if (layers.length === 1) return;
    opsRef.current = opsRef.current.filter((op) => layerIdOf(op) !== id);
    layerCanvases.current.delete(id);
    const next = layers.filter((layer) => layer.id !== id);
    setLayers(next);
    if (activeLayerId === id) setActiveLayerId(next.at(-1)?.id ?? next[0].id);
    composite();
  };

  const updateLayer = (id: string, patch: Partial<CanvasLayer>) => {
    setLayers((current) => current.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  };

  const moveLayer = (id: string, direction: -1 | 1) => {
    setLayers((current) => {
      const index = current.findIndex((layer) => layer.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [layer] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, layer);
      return copy;
    });
  };

  useEffect(() => { composite(); }, [layers, composite]);

  useEffect(() => {
    if (!bootDraft) return;
    let cancelled = false;
    const bitmaps = bootDraft.layers.filter((layer) => layer.dataUrl);
    const finish = () => {
      if (cancelled) return;
      setBaked(true);
      composite();
      bump("Draft restored. Undo starts from this still.");
    };
    if (!bitmaps.length && bootDraft.composite) {
      const image = new window.Image();
      image.onload = () => {
        if (cancelled) return;
        const base = document.createElement("canvas");
        base.width = CANVAS_WIDTH;
        base.height = CANVAS_HEIGHT;
        const ctx = base.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        baseRef.current = base;
        rebuildLayer("layer-1");
        finish();
      };
      image.src = bootDraft.composite;
      return () => { cancelled = true; };
    }
    let remaining = bitmaps.length;
    if (!remaining) return;
    for (const layer of bitmaps) {
      const image = new window.Image();
      image.onload = () => {
        if (cancelled) return;
        const ctx = canvasFor(layer.id).getContext("2d");
        ctx?.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        remaining -= 1;
        if (remaining <= 0) finish();
      };
      image.src = layer.dataUrl ?? "";
    }
    return () => { cancelled = true; };
  }, [bootDraft, bump, canvasFor, composite, rebuildLayer]);

  useEffect(() => {
    if (!initialImage || bootDraft) return;
    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      if (cancelled) return;
      const base = document.createElement("canvas");
      base.width = CANVAS_WIDTH;
      base.height = CANVAS_HEIGHT;
      const ctx = base.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      baseRef.current = base;
      setBaked(true);
      rebuildLayer("layer-1");
      composite();
      bump("Previous drawing loaded on Layer 1.");
    };
    image.src = initialImage;
    return () => { cancelled = true; };
  }, [bootDraft, bump, composite, initialImage, rebuildLayer]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;
      if (meta && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (key === "1") selectBrush("pencil");
      if (key === "2") selectBrush("ink");
      if (key === "3") selectBrush("marker");
      if (key === "4") selectBrush("airbrush");
      if (key === "e") setTool("eraser");
      if (key === "g") setTool("fill");
      if (key === "i") setTool("eyedropper");
      if (key === "m") setSymmetry((value) => !value);
      if (key === "[") setSize((value) => clampBrushSize(value - 4));
      if (key === "]") setSize((value) => clampBrushSize(value + 4));
      if (key === "=" || key === "+") setZoom((value) => clampZoom(value + 0.1));
      if (key === "-") setZoom((value) => clampZoom(value - 0.1));
      if (key === "0") setZoom(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fitStage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pad = stage.clientWidth >= 1024 ? 32 : 8;
    setZoom(fitCanvasZoom(stage.clientWidth - pad));
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const apply = () => {
      if (!userZoomed.current) fitStage();
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [fitStage]);

  const setManualZoom = (next: number | ((value: number) => number)) => {
    userZoomed.current = true;
    setZoom((value) => clampZoom(typeof next === "function" ? next(value) : next));
  };

  const resetFit = () => {
    userZoomed.current = false;
    fitStage();
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    setManualZoom((value) => value + (event.deltaY > 0 ? -0.1 : 0.1));
  };

  const exportDrawing = () => {
    const drawing = capture();
    if (!drawing) {
      setError(emptyDrawingMessage(false));
      return;
    }
    onExport?.(drawing);
  };

  const cursor = tool === "fill" ? "cell" : tool === "eyedropper" ? "copy" : "crosshair";
  const selected = layers.find((layer) => layer.id === activeLayerId);
  const panel = (id: typeof inspector) => `${inspector === id ? "block" : "hidden"} lg:block`;

  return (
    <div className={compact ? "min-w-0 space-y-3" : "grid min-w-0 gap-3 lg:grid-cols-[72px_minmax(0,1fr)_18rem] lg:gap-4"}>
      <div role="radiogroup" aria-label="Studio tools" className={`no-scrollbar flex gap-1 overflow-x-auto ${compact ? "flex-wrap rounded-full bg-white p-1 ring-1 ring-black/10" : "rounded-[1.2rem] bg-ink p-1.5 text-white lg:flex-col lg:rounded-[1.6rem] lg:p-2"}`}>
        {BRUSH_PRESETS.map((preset) => (
          <ToolButton key={preset.id} dark={!compact} active={tool === preset.id} label={preset.label} shortcut={String(BRUSH_PRESETS.findIndex((item) => item.id === preset.id) + 1)} onClick={() => selectBrush(preset.id)}>
            {preset.id === "pencil" ? <PencilSimple size={18} /> : preset.id === "ink" ? <PenNib size={18} /> : preset.id === "marker" ? <Square size={18} /> : <Drop size={18} />}
          </ToolButton>
        ))}
        <ToolButton dark={!compact} active={tool === "eraser"} label="Eraser" shortcut="E" onClick={() => setTool("eraser")}><Eraser size={18} /></ToolButton>
        <ToolButton dark={!compact} active={tool === "fill"} label="Fill" shortcut="G" onClick={() => setTool("fill")}><PaintBucket size={18} /></ToolButton>
        <ToolButton dark={!compact} active={tool === "eyedropper"} label="Sample" shortcut="I" onClick={() => setTool("eyedropper")}><Eyedropper size={18} /></ToolButton>
        <button type="button" onClick={() => setSymmetry((value) => !value)} className={`grid min-h-11 min-w-11 place-items-center rounded-2xl ${symmetry ? "bg-plum text-white" : compact ? "text-black/50" : "text-white/60 hover:bg-white/10"}`} aria-pressed={symmetry} aria-label="Vertical symmetry"><WaveSine size={18} /></button>
        <button type="button" onClick={undo} disabled={!opCount} className={`grid min-h-11 min-w-11 place-items-center rounded-2xl disabled:opacity-30 ${compact ? "bg-white" : "hover:bg-white/10"}`} aria-label="Undo"><ArrowCounterClockwise size={18} /></button>
        <button type="button" onClick={redo} disabled={!redoCount} className={`grid min-h-11 min-w-11 place-items-center rounded-2xl disabled:opacity-30 ${compact ? "bg-white" : "hover:bg-white/10"}`} aria-label="Redo"><ArrowClockwise size={18} /></button>
        <button type="button" onClick={clearCanvas} className={`grid min-h-11 min-w-11 place-items-center rounded-2xl ${compact ? "bg-white" : "hover:bg-white/10"}`} aria-label="Clear canvas"><Trash size={18} /></button>
      </div>

      <div className="min-w-0">
        <div ref={stageRef} onWheel={onWheel} className={`w-full min-w-0 overflow-auto overscroll-contain rounded-[1.2rem] lg:rounded-[1.6rem] ${compact ? "ring-1 ring-black/10" : "max-h-[min(62dvh,calc(100dvh-16rem))] bg-[#241f2b] p-1 sm:p-3 lg:max-h-[calc(100dvh-8rem)] lg:p-4"}`}>
          <div className="relative mx-auto origin-top" style={{ width: CANVAS_WIDTH * zoom, height: CANVAS_HEIGHT * zoom }}>
            <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ background: paper }}>
              {ghostImage && <img src={ghostImage} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35" />}
              <canvas
                ref={displayRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="absolute inset-0 h-full w-full touch-none"
                style={{ touchAction: "none", cursor }}
                role="img"
                aria-label="Drawing canvas"
                aria-describedby={liveId}
                onPointerDown={beginStroke}
                onPointerMove={moveStroke}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm sm:mt-3">
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-black/10" aria-label="Zoom out" onClick={() => setManualZoom((value) => value - 0.1)}><Minus size={14} /></button>
          <span className="w-12 text-center font-bold">{Math.round(zoom * 100)}%</span>
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-black/10" aria-label="Zoom in" onClick={() => setManualZoom((value) => value + 0.1)}><Plus size={14} /></button>
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-black/10" aria-label="Fit canvas to screen" onClick={resetFit}><ArrowsOut size={14} /></button>
          <p id={liveId} className="min-w-0 flex-1 text-xs text-black/50 sm:text-sm" aria-live="polite">{status}</p>
        </div>
      </div>

      <aside className="space-y-3 rounded-[1.2rem] bg-white p-3 ring-1 ring-black/[0.06] sm:space-y-4 sm:rounded-[1.6rem] sm:p-4">
        <div className="grid grid-cols-4 gap-1 lg:hidden" role="tablist" aria-label="Studio panels">
          {([
            ["brush", "Brush", Sliders],
            ["color", "Color", Palette],
            ["layers", "Layers", Stack],
            ["more", "Publish", PaperPlaneTilt],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={inspector === id}
              onClick={() => setInspector(id)}
              className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-bold ${inspector === id ? "bg-ink text-white" : "bg-mist text-plum"}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <section className={panel("brush")}>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Brush</h2>
          <label className="mt-3 block text-sm font-bold">Size<input type="range" min={MIN_BRUSH_SIZE} max={MAX_BRUSH_SIZE} value={size} onChange={(event) => setSize(Number(event.target.value))} className="mt-1 w-full accent-plum" /></label>
          <label className="mt-3 block text-sm font-bold">Opacity<input type="range" min={0.08} max={1} step={0.02} value={opacity} onChange={(event) => setOpacity(clampUnit(Number(event.target.value)))} className="mt-1 w-full accent-plum" /></label>
          <label className="mt-3 block text-sm font-bold">Hardness<input type="range" min={0} max={1} step={0.02} value={hardness} onChange={(event) => setHardness(clampUnit(Number(event.target.value)))} className="mt-1 w-full accent-plum" /></label>
          <label className="mt-3 block text-sm font-bold">Stabilizer<input type="range" min={0} max={0.85} step={0.05} value={stabilizer} onChange={(event) => setStabilizer(Number(event.target.value))} className="mt-1 w-full accent-plum" /></label>
        </section>
        <section className={panel("color")}>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Color</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...recent, ...BRUSH_COLORS.map((item) => item.value).filter((item) => !recent.includes(item))].slice(0, 14).map((value) => (
              <button key={value} type="button" aria-label={value} onClick={() => rememberColor(value)} className={`size-9 rounded-full sm:size-7 ${color === value ? "ring-2 ring-ink ring-offset-2" : "ring-1 ring-black/15"}`} style={{ background: value }} />
            ))}
            <label className="grid size-9 place-items-center overflow-hidden rounded-full ring-1 ring-black/15 sm:size-7"><span className="sr-only">Custom color</span><input type="color" value={color} onChange={(event) => rememberColor(event.target.value)} className="size-10 -translate-y-1 cursor-pointer border-0 bg-transparent p-0" /></label>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {PAPER_PRESETS.map((item) => (
              <button key={item.id} type="button" onClick={() => setPaper(item.value)} className={`min-h-9 rounded-full px-3 py-1 text-[11px] font-bold ${paper === item.value ? "bg-ink text-white" : "bg-mist text-plum"}`}>{item.label}</button>
            ))}
          </div>
        </section>
        <section className={panel("layers")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Layers</h2>
            <button type="button" onClick={addLayer} disabled={layers.length >= MAX_LAYERS} className="grid size-11 place-items-center rounded-full bg-mist text-plum disabled:opacity-30" aria-label="Add layer"><Plus size={14} /></button>
          </div>
          <ul className="mt-2 space-y-1">
            {[...layers].reverse().map((layer) => (
              <li key={layer.id}>
                <button type="button" onClick={() => setActiveLayerId(layer.id)} className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-2 py-2 text-left text-sm ${layer.id === activeLayerId ? "bg-mist font-bold" : "hover:bg-black/[0.03]"}`}>
                  <span className="flex-1 truncate">{layer.name}</span>
                  <span className="text-[11px] text-black/40">{Math.round(layer.opacity * 100)}%</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-5 text-black/45">{bootDraft ? "Draft restored. Undo starts from this still." : "Drafts save while you draw."}</p>
          {selected && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => updateLayer(selected.id, { visible: !selected.visible })} className="grid size-11 place-items-center rounded-full bg-mist" aria-label="Toggle visibility"><Eye size={15} className={selected.visible ? "text-ink" : "text-black/30"} /></button>
              <button type="button" onClick={() => updateLayer(selected.id, { locked: !selected.locked })} className="grid size-11 place-items-center rounded-full bg-mist" aria-label="Toggle lock"><LockSimple size={15} className={selected.locked ? "text-plum" : "text-black/30"} /></button>
              <button type="button" onClick={() => moveLayer(selected.id, 1)} className="min-h-11 rounded-full bg-mist px-3 text-xs font-bold">Up</button>
              <button type="button" onClick={() => moveLayer(selected.id, -1)} className="min-h-11 rounded-full bg-mist px-3 text-xs font-bold">Down</button>
              <button type="button" onClick={() => removeLayer(selected.id)} disabled={layers.length === 1 || selected.id === "layer-1"} className="min-h-11 rounded-full bg-mist px-3 text-xs font-bold text-red-700 disabled:opacity-30">Delete</button>
              <label className="block w-full text-xs font-bold">Opacity<input type="range" min={0.1} max={1} step={0.05} value={selected.opacity} onChange={(event) => updateLayer(selected.id, { opacity: Number(event.target.value) })} className="mt-1 w-full accent-plum" /></label>
            </div>
          )}
        </section>
        <div className={panel("more")}>
          {references.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">References</h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {references.map((item) => item.preview ? <img key={item.id} src={item.preview} alt={item.name} className="aspect-square w-full rounded-2xl object-cover" /> : <p key={item.id} className="text-xs">{item.name}</p>)}
              </div>
            </section>
          )}
          {sidebarExtra}
          {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
          {showAction && <Button onClick={exportDrawing} disabled={busy} className="mt-3 w-full">{actionLabel}</Button>}
        </div>
      </aside>
    </div>
  );
});

function ToolButton({ active, dark, label, shortcut, onClick, children }: { active: boolean; dark?: boolean; label: string; shortcut: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={`${label}, shortcut ${shortcut}`}
      title={`${label} (${shortcut})`}
      onClick={onClick}
      className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold ${active ? "bg-plum text-white" : dark ? "text-white/70 hover:bg-white/10" : "text-black/55 hover:text-ink"}`}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
