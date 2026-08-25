"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { applyCanvasOp } from "@/lib/domain/canvas";
import { replayDurationMs, type ProcessLog } from "@/lib/domain/process-log";
import { Button } from "@/components/ui/button";

export function ReplayPlayer({
  stillSrc,
  alt,
  processLog,
  reducedMotion,
  onPlayed,
  onCompleted,
}: {
  stillSrc: string;
  alt: string;
  processLog: ProcessLog;
  reducedMotion: boolean;
  onPlayed?: () => void;
  onCompleted?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const duration = replayDurationMs(processLog.ops);

  const clearPaper = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = processLog.paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [processLog.paperColor]);

  useEffect(() => {
    clearPaper();
    return () => cancelAnimationFrame(frameRef.current);
  }, [clearPaper]);

  const play = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || playing) return;
    cancelAnimationFrame(frameRef.current);
    setPlaying(true);
    onPlayed?.();
    ctx.fillStyle = processLog.paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const started = performance.now();
    let applied = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / Math.max(duration, 1));
      const target = Math.min(processLog.ops.length, Math.ceil(progress * processLog.ops.length));
      while (applied < target) {
        applyCanvasOp(ctx, processLog.ops[applied]);
        applied += 1;
      }
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      setPlaying(false);
      onCompleted?.();
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(frameRef.current);
    setPlaying(false);
    clearPaper();
  };

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] bg-mist"
      onMouseEnter={() => {
        if (reducedMotion || playing) return;
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
      <div className="absolute bottom-4 left-4">
        <Button onClick={playing ? stop : play} aria-label={playing ? "Pause replay" : "Play replay"}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? "Pause" : "Play replay"}
        </Button>
      </div>
    </div>
  );
}
