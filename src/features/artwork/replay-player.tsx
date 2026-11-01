"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { applyCanvasOp } from "@/lib/domain/canvas";
import { replayDurationMs, type ProcessLog } from "@/lib/domain/process-log";
import { Button } from "@/components/ui/button";

export type ReplayPlayerHandle = {
  play: () => void;
  stop: () => void;
};

export const ReplayPlayer = forwardRef<ReplayPlayerHandle, {
  stillSrc: string;
  alt: string;
  processLog: ProcessLog;
  reducedMotion: boolean;
  hideTransport?: boolean;
  onPlayed?: () => void;
  onCompleted?: () => void;
}>(function ReplayPlayer({
  stillSrc,
  alt,
  processLog,
  reducedMotion,
  hideTransport = false,
  onPlayed,
  onCompleted,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const duration = replayDurationMs(processLog.ops);

  const clearPaper = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = processLog.paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [processLog.paperColor]);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setPlaying(false);
    setProgress(0);
    clearPaper();
  }, [clearPaper]);

  const play = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    cancelAnimationFrame(frameRef.current);
    setPlaying(true);
    setProgress(0);
    onPlayed?.();
    ctx.fillStyle = processLog.paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const started = performance.now();
    let applied = 0;
    const tick = (now: number) => {
      const next = Math.min(1, (now - started) / Math.max(duration, 1));
      setProgress(next);
      const target = Math.min(processLog.ops.length, Math.ceil(next * processLog.ops.length));
      while (applied < target) {
        applyCanvasOp(ctx, processLog.ops[applied]);
        applied += 1;
      }
      if (next < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      setPlaying(false);
      onCompleted?.();
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [duration, onCompleted, onPlayed, processLog.ops, processLog.paperColor]);

  useImperativeHandle(ref, () => ({ play, stop }), [play, stop]);

  useEffect(() => {
    clearPaper();
    return () => cancelAnimationFrame(frameRef.current);
  }, [clearPaper]);

  return (
    <div
      className="relative overflow-hidden rounded-[1.4rem] bg-mist sm:rounded-[2rem]"
      onMouseEnter={() => {
        if (reducedMotion || playing || hideTransport) return;
        if (window.matchMedia("(hover: hover)").matches) play();
      }}
    >
      <img src={stillSrc} alt={alt} width={processLog.width} height={processLog.height} className={`h-auto w-full ${playing ? "opacity-0" : "opacity-100"}`} />
      <canvas
        ref={canvasRef}
        width={processLog.width}
        height={processLog.height}
        className={`absolute inset-0 h-full w-full ${playing ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/10">
        <div className="h-full bg-plum transition-[width] duration-75" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      {!hideTransport && (
        <div className="absolute bottom-4 left-4">
          <Button onClick={playing ? stop : play} aria-label={playing ? "Pause replay" : "Play replay"}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "Pause" : "Play replay"}
          </Button>
        </div>
      )}
    </div>
  );
});
